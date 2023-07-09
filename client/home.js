const welcomeText = document.getElementById("welcome");
const logoutButton = document.getElementById("logout");
const nameChangeInput = document.getElementById("nameChange");
const nameChangeButton = document.getElementById("nameChangeButton");

welcomeText.style.display = "none";

// get current user info
const auth = async () => {
    const response = await fetch("/api/auth", {
        method: "GET",
    })
    const userData = await response.json();
    if(!response.ok) {
        window.location.href = "/login";
    }
    else {
        welcomeText.style.display = "block";
        welcomeText.innerText = "Welcome " + userData.userName + "\nYour Email: " + userData.userEmail + "\nValidated: " + (userData.verified ? "Yes" : "No"); 
    }
}

auth();

logoutButton.addEventListener("click", async () => {
    const response = await fetch("/api/logout", {
        method: "GET"
    })
    if(response.ok) window.location.href = "/login";
})

nameChangeButton.addEventListener("click", async () => {
    const response = await fetch("/api/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            newName: nameChangeInput.value
        })
    })

    if(response.ok) {
        nameChangeInput.value = "";
        auth();
    }
})