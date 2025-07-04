import { getPosts, loadPost, showPostForm } from './posts.js';
import { handleLogin } from './auth.js';
import { setLoginState } from './state.js';

function updateUI(isLoggedIn) {
    const loginBtn = document.getElementById("loginBtn");
    const postBtnContainer = document.getElementById("postBtnContainer");

    if (isLoggedIn) {
        loginBtn.innerHTML = "Logout";
        postBtnContainer.style.display = "block";
    } else {
        loginBtn.innerHTML = "Login";
        postBtnContainer.style.display = "none";
    }
}

function initializePage() {
    const token = sessionStorage.getItem("token");
    const stateChanged = setLoginState(!!token, token);

    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('post');

    if (postSlug) {
        if (!stateChanged) {
            loadPost(postSlug);
        }
    } else {
        getPosts();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginBtn").addEventListener("click", handleLogin);
    document.getElementById("postBtn").addEventListener("click", (event) => {
        event.preventDefault();
        if (sessionStorage.getItem("token")) {
            showPostForm();
        }
    });

    window.addEventListener('loginStateChange', () => {
        const isLoggedIn = !!sessionStorage.getItem("token");
        updateUI(isLoggedIn);

        const urlParams = new URLSearchParams(window.location.search);
        const postSlug = urlParams.get('post');
        if (postSlug) {
            loadPost(postSlug);
        }
    });

    initializePage();
});

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        initializePage();
    }
});
