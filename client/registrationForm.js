const submitButton = document.getElementById("submitButton");
const loginButton = document.getElementById("loginButton");
const nameBox = document.getElementById("name");
const emailBox = document.getElementById("email");
const passwordBox = document.getElementById("password");
const alertBox = document.getElementById("alert");

// redirect user if logged in
const auth = async () => {
    const response = await fetch("/api/auth", {
        method: "GET",
    })
    if(response.ok) window.location.href = "/home"
}

auth();


alertBox.style.display = "none";

submitButton.addEventListener("click", () => {
    const serverCall = async () => {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: nameBox.value,
                email: emailBox.value,
                password: passwordBox.value,
            })
        })

        if(!response.ok) {
            const errorResponseText = await response.json();
            alertBox.style.display = "block";
            alertBox.innerHTML = errorResponseText.error;
            nameBox.value = "";
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

loginButton.addEventListener("click", () => { window.location.href = "/login"})