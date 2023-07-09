import http from "http"
import serveFile from "./staticFileServe.js";
import connection from "./db.js";
import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import transport from "./emailSender.js";
import emailTemplate from "./emailTemplate.js";
import "dotenv/config.js"

// Utility functions

const readBody = (req, callback) => {
    var body = "";
    req.on("data", (chunk) => {
        body += chunk
    });
    req.on("end", () => {
        return callback(JSON.parse(body));
    })
}

const sendResToClient = (res, code, body) => {
    res.writeHead(code);
    if(body != undefined) res.write(JSON.stringify(body));
    res.end();
}

const getSession = async (value, currentDate) => {
    try {
        const [results] = await connection.execute("SELECT users.id, users.name, users.email, users.verified FROM users INNER JOIN sessions ON users.id = sessions.user_id WHERE sessions.id = ? AND sessions.expires >= ?", [value, currentDate]);
            if(results.length == 0) return { userId: undefined, userName: undefined, userEmail: undefined, verified: undefined};
            return { userId: results[0].id, userName: results[0].name, userEmail: results[0].email, verified: results[0].verified};
    } catch(err) {
        throw "Cannot read session from database";
    }
}

const clearSession = async (value, currentDate) => {
    try {
        await connection.execute("DELETE FROM sessions WHERE id=?", [value]);
    } catch(err) {
        throw "Cannot clear session from database";
    }
}

const parseCookie = async (req, handleSession) => {
    var cookies = req.headers.cookie;
    if(!cookies) return {userId: undefined, userName: undefined, userEmail: undefined, verified: undefined};

    cookies = cookies.split(';');
    var userData;

    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].split('=')[0] != "auth") return;
        const value = cookies[i].split('=')[1];

        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ')

        userData = await handleSession(value, currentDate);
    }

    return userData;
}

const setCookie = async (res, userId) => {
    var newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + 15);

    const sessionId = v4();

    res.setHeader("Set-Cookie", "auth="+ sessionId + ";expires=" + newDate.toUTCString() + ";path=/")

    // to convert to mysql datetime format
    newDate = newDate.toISOString().slice(0, 19).replace('T', ' ');

    // add session to database
    try { await connection.execute("INSERT INTO sessions(id, user_id, expires) VALUES (?, ?, ?);", [sessionId, userId, newDate]); }
    catch(err) { throw "Couldn't create session"; }
}

const sendEmail = async (userEmail, userId) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Validate your App email",
        html: emailTemplate(userId)
    }
    //var successfullySent = false;
    try {
        await transport.sendMail(mailOptions);
        transport.close();
        return true;
    }
    catch(err){
        return false;
    }
    //return successfullySent;
}

// Server

const server = http.createServer((req, res) => {

    // Note: these CORS remedies are not needed for production, just for testing with separate front end server

    // // CORS headers
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE, OPTIONS');
    // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
    // res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
    
    // this is necessary for CORS and preflight requests
    // https://bigcodenerd.org/enable-cors-node-js-without-express/
    // if (req.method === "OPTIONS") {
    //     res.writeHead(204);
    //     res.end();
    //     return;
    // }

    if(req.method == "GET" && !req.url.startsWith("/api/")) {
        serveFile(req, res);
    }

    else if(req.url == "/api/register" && req.method == "POST") {
        res.setHeader("Content-Type", "application/json");
        readBody(req, (body) => {

            // input data
            const userName = body.name;
            const userEmail = body.email;
            const userPassword = body.password;

            // validate name
            if(userName.length > 50) {
                sendResToClient(res, 400, {error: "Invalid name"});
                return;
            }

            // validate password
            if(userPassword.length < 8 || userPassword.length > 20) {
                sendResToClient(res, 400, {error: "Invalid password"});
                return;
            }
            
            const registration = async () => {

                try {
                    const [results] = await connection.execute("SELECT * FROM users WHERE email = ?", [userEmail]);
                    
                    // No other account with that email -> add to database
                    if(results.length == 0) {
                        
                        // generate user id
                        const userId = v4();

                        // validate email by sending one and seeing if it works
                        if(!(await sendEmail(userEmail, userId))) {
                            sendResToClient(res, 403, {error: "Invalid email"})
                            return;
                        }

                        try {
                            // hash password
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(userPassword, salt, async (err, hash) => {
                                    await connection.execute("INSERT INTO users(id, name, email, password) VALUES (?, ?, ?, ?)", [userId, userName, userEmail, hash]);
                                    try {
                                        // generate session token + cookie
                                        await setCookie(res, userId);
                                        sendResToClient(res, 200);
                                    } catch(err) {
                                        sendResToClient(res, 500, {error: err});
                                    }
                                })
                            })
                        }
                        catch(err) {
                            sendResToClient(res, 500, {error: "Cannot perform registration"});
                        }
                    }

                    // There are other accounts -> error
                    else {
                        sendResToClient(res, 403, {error: "Account already present"});
                    }
                }
                catch(err) {
                    sendResToClient(res, 500, {error: "Cannot perform database query"})
                }
            }

            registration();

        });
    }

    else if(req.url == "/api/login" && req.method == "POST") {
        res.setHeader("Content-Type", "application/json");
        readBody(req, (body) => {

            const userEmail = body.email;
            const userPassword = body.password;

            // validate password
            if(userPassword.length < 8 || userPassword.length > 20) {
                sendResToClient(res, 400, {error: "Invalid password"});
                return;
            }
            
            const checkUser = async () => {
                try {
                    const [results] = await connection.execute("SELECT * FROM users WHERE email = ?", [userEmail]);

                    // There is an account with that email
                    if(results.length > 0) {
                        // Check if passwords match
                        if(await bcrypt.compare(userPassword, results[0].password)) {
                            try {
                                // generate session token + cookie
                                await setCookie(res, results[0].id);
                                sendResToClient(res, 200);
                            }
                            catch(errMsg) {
                                sendResToClient(res, 500, {error: errMsg});
                            }
                        }
                        else sendResToClient(res, 403, {error: "Unauthorized"});
                    }
                    else {
                        sendResToClient(res, 403, {error: "Invalid credentials"});
                    }
                }
                catch(err) {
                    sendResToClient(res, 500, "Invalid database query");
                }
            }
            checkUser();
        })
    }

    else if(req.url == "/api/auth" && req.method == "GET") {
        const handleAuth = async () => {
            try {
                const userData = await parseCookie(req, getSession);
                console.log(userData)
                if(!userData.userEmail) sendResToClient(res, 403, {error: "Unauthorized"})
                else sendResToClient(res, 200, userData);
            } catch(err) {
                sendResToClient(res, 500, err);
            }
        }
        handleAuth();
    }

    else if(req.url == "/api/logout" && req.method == "GET") {
        const handleLogout = async () => {
            try {
                await parseCookie(req, clearSession);
                sendResToClient(res, 200);
            }
            catch(err) {
                sendResToClient(res, 500, {error: "Server error"});   
            }
        }
        handleLogout();
    }
    
    else if(req.url == "/api/update" && req.method == "POST") {
        const handleUpdate = async () => {
            try {
                // verify user
                const userData = await parseCookie(req, getSession);
                console.log(userData)
                if(!userData.userEmail) sendResToClient(res, 403, {error: "Unauthorized"})
                else {
                    // we are ready to change name
                    readBody(req, async body => {
                        console.log(userData.userId)
                        try {
                            await connection.execute("UPDATE users SET name = ? WHERE id = ?", [body.newName, userData.userId]);
                            sendResToClient(res, 200);
                        }
                        catch(err) {
                            sendResToClient(res, 500, {error: "Server error"});
                        }
                    })
                }
            } catch(err) {
                sendResToClient(res, 500, err);
            }
        }
        handleUpdate();
    }

    else if(req.url.startsWith("/api/email") && req.method == "GET") {
        const handleEmail = async () => {
            const parameters = req.url.split('?');
            const id = parameters[1].split('=')[1];
            console.log(id);
            
            try {
                const [results] = await connection.execute("SELECT * FROM users WHERE id=?", [id]);

                if(results.length == 1) {
                    try {
                        await connection.execute("UPDATE users SET verified = true WHERE id=?", [id]);
                        sendResToClient(res, 200, "Now you can go back and refresh the page");
                    }
                    catch(err) {
                        sendResToClient(res, 500, "Database error");
                    }
                }
                else {
                    sendResToClient(res, 404, "Route not found");
                }
            }
            catch(err) {
                sendResToClient(res, 500, "Couldn't validate email");
            }
    
        }
        handleEmail();
    }

    else {
        sendResToClient(res, 404, "Route not found");
    }
})

const PORT = 5000;
server.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`)});