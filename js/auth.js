import * as api from './api.js';
import { setLoginState } from './state.js';

export function handleLogin() {
    if (sessionStorage.getItem("token")) {
        if (confirm("Do you want to logout?")) {
            sessionStorage.removeItem("token");
            setLoginState(false, null);
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
            setLoginState(true, token);
        } else {
            const errorMessage = responseData.message || response.status;
            alert(`Authentication failed: ${errorMessage}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert(`An error occurred during the request: ${error.message}`);
    }
}
