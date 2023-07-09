import fs from "fs"
import path from "path"

const notfound = (res) => {
    res.writeHead(404);
    res.write("Route not found");
    res.end();
}

// Adapted from:
// https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
const serveFile = (req, res) => {
    var filepath = "./client" + req.url;

    // check that we are requesting a route and not a static file
    if(!path.extname(filepath)) {
        // listing route entry points
        switch(filepath) {
            case "./client/":
                filepath = "./client/registrationForm.html"
                break;
            case "./client/home":
                filepath = "./client/home.html";
                break;
            case "./client/login":
                filepath = "./client/loginForm.html";
                break;
            default:
                notfound(res);
                return;
        }
    }

    var contentType;
    switch(path.extname(filepath)) {
        case '.js':
            contentType = "text/javascript";
            break;
        case ".html":
            contentType = "text/html";
            break;
        case ".css":
            contentType = "text/css";
            break;
    }
    
    if(!contentType) {
        notfound(res);
        return;
    }

    res.writeHead(200, {"Content-Type": contentType})
    fs.readFile(filepath, null, (error, data) => {
        if(error) {
            notfound(res);
        }
        else {
            res.write(data);
            res.end();
        }
    })
}

export default serveFile;