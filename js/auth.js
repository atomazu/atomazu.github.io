import * as api from './api.js';

export function handleLogin() {
    if (sessionStorage.getItem("token")) {
        if (confirm("Do you want to logout?")) {
            document.getElementById("loginBtn").innerHTML = "Login";
            document.getElementById("postBtn").innerHTML = "";
            sessionStorage.removeItem("token");
        }
        return;
    }

    const token = prompt("Please enter your authentication token.");
    if (token === null) {
        return;
    }

    validateToken(token);
}

async function validateToken(token) {
    try {
        const response = await api.validateToken(token);
        const responseData = await response.json();

        if (response.ok) {
            sessionStorage.setItem("token", token);
            document.getElementById("loginBtn").innerHTML = "Logout";
            document.getElementById("postBtn").innerHTML = "Post";
        } else {
            const errorMessage = responseData.message || response.status;
            alert(`Authentication failed: ${errorMessage}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert(`An error occurred during the request: ${error.message}`);
    }
}
