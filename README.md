# A simple authentication app
<br/>
Features:<br/>
- Registration/Login/Logout<br/>
- Authentication via cookies and session tokens<br/>
- Email validation<br/>
- Name change<br/>
<br/>
Frontend - Vanilla JS, HTML, CSS<br/>
Backend - Node.js, **NO** Express<br/>
Database - Mysql<br/>
<br/>
Used NPM packages:<br/>
- bcryptjs - for password hashing<br/>
- dotenv - for securing sensitive information<br/>
- googleapis - for enabling oauth2 authentication and sending gmail<br/>
- mysql2 - for making queries to mysql database<br/>
- nodemailer - for sending emails<br/>
- uuid - for generating user and session ids<br/>
<br/>
File structure:<br/>
├── client - front end<br/>
│   ├── home.js, home.html - main page files<br/>
│   ├── form.css - for styling<br/>
│   ├── loginForm.js, loginForm.html - login page files<br/>
│   ├── registrationForm.html, registrationForm.js - registration page files<br/>
├── staticFileServe.js - function for serving all the needed static files<br/>
├── server.js - main server and api routes<br/>
├── emailTemplate.js - validation email html template<br/>
├── emailSender.js - for oauth2 authentication and initialising transport<br/>
├── db.js - for connecting to database<br/>
├── package.json<br/>
├── package-lock.json <br/>
└── .gitignore<br/>