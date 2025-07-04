import { getPosts, loadPost, showPostForm } from './posts.js';
import { handleLogin } from './auth.js';

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("postBtn").innerHTML = "";

    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('post');

    if (postSlug) {
        loadPost(postSlug);
    } else {
        getPosts();
    }

    document.getElementById("loginBtn").addEventListener("click", handleLogin);
    document.getElementById("postBtn").addEventListener("click", (event) => {
        event.preventDefault();
        if (sessionStorage.getItem("token")) {
            showPostForm();
        }
    });
});
