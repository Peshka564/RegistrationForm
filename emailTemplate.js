const emailTemplate = (userId) => {
    return `<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            html {
                font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
            }

            .heading {
                display: block;
                text-align: center;
                color: darkcyan;
                margin: 50px auto;
                font-weight: bolder;
            }

            .wrapper {
                padding: 50px;
                background-color: lightgray;
                margin: auto;
                width: 100%;
                border-radius: 20px;
            }

            .main-content {
                background-color: azure;
                border-radius: 10px;
                width: 50%;
                margin: auto;
                padding: 30px;
                padding-bottom: 60px;
            }

            .semi-heading {
                font-weight: bold;
                text-align: left;
                font-size: 1.5em;
            }

            a {
                text-align: center;
                display: block;
                text-decoration: none;
                background-color: darkcyan;
                color: white;
                border: none;
                border-radius: 10px;
                padding: 30px;
                font-size: 1.5em;
                font-weight: bolder;
                width: 50%;
                margin: auto;
            }

            .text {
                margin-bottom: 100px;
                font-weight: 600;
            }

            a:hover {
                box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <h1 class="heading">APP</h1>
            <div class="main-content">
                <h2 class="semi-heading">Thank you for using my App!</h2>
                <p class="text">To complete your App profile, we need you to confirm your email address so we know that you are reachable at this address.</p>
                <a href="http://localhost:5000/api/email?id=${userId}">VERIFY EMAIL ADDRESS</a>
            </div>
        </div>
    </body>
</html>`
}

export default emailTemplate;