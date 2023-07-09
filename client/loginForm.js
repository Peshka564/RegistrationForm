const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const emailBox = document.getElementById("email");
const passwordBox = document.getElementById("password");
const alertBox = document.getElementById("alert");

alertBox.style.display = "none";

// var newDate = new Date();
// newDate.setMinutes(newDate.getMinutes() + 180 + 20);

// document.cookie = "name=Peshooo;expires=" + newDate.toUTCString();
// document.cookie = "name=Mishooo;";
// console.log(document.cookie)

loginButton.addEventListener("click", () => {
    const serverCall = async () => {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: emailBox.value,
                password: passwordBox.value,
            })
        })

        if(!response.ok) {
            const errorResponseText = await response.json();
            alertBox.style.display = "block";
            alertBox.innerHTML = errorResponseText.error;
            emailBox.value = "";
            passwordBox.value = "";
        }
        else {
            alertBox.style.display = "none";
            window.location.href = "/home";
        }
    }
    serverCall();
})

registerButton.addEventListener("click", () => { window.location.href = "/"})