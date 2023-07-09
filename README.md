# A simple authentication app
<br/>
Features:
- Registration/Login/Logout
- Authentication via cookies and session tokens
- Email validation
- Name change
<br/>
Frontend - Vanilla JS, HTML, CSS
Backend - Node.js, **NO** Express
Database - Mysql
<br/>
Used NPM packages:
- bcryptjs - for password hashing
- dotenv - for securing sensitive information
- googleapis - for enabling oauth2 authentication and sending gmail
- mysql2 - for making queries to mysql database
- nodemailer - for sending emails
- uuid - for generating user and session ids
<br/>
File structure:
```
├── client - front end
│   ├── home.js, home.html - main page files
│   ├── form.css - for styling
│   ├── loginForm.js, loginForm.html - login page files
│   ├── registrationForm.html, registrationForm.js - registration page files
├── staticFileServe.js - function for serving all the needed static files
├── server.js - main server and api routes
├── emailTemplate.js - validation email html template
├── emailSender.js - for oauth2 authentication and initialising transport
├── db.js - for connecting to database
├── package.json
├── package-lock.json 
└── .gitignore
```