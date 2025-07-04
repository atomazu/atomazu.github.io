import * as api from './api.js';
import * as ui from './ui.js';

const contentEl = document.getElementById("content");

export async function getPosts() {
    try {
        contentEl.innerHTML = '<p id="loadElm" class="loading-symbol">ᕕ(ᐛ)ᕗ</p>';
        const response = await api.fetchPosts();
        const responseData = await response.json();

        if (response.ok) {
            const postsHTML = ui.renderPostList(responseData);
            ui.setContentWithFade(contentEl, postsHTML);
        } else {
            const errorMessage = responseData.message || response.status;
            const errorHTML = `<p class="error">Couldn't load posts: ${errorMessage}</p>`;
            ui.setContentWithFade(contentEl, errorHTML);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        const errorHTML = `<p class="error">An error occurred during the request: ${error.message}</p>`;
        ui.setContentWithFade(contentEl, errorHTML);
    }
}

export async function loadPost(slug) {
    try {
        contentEl.innerHTML = '<p id="loadElm" class="loading-symbol">ᕕ(ᐛ)ᕗ</p>';
        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts')) || [];
        const isFirstView = !viewedPosts.includes(slug);

        const response = await api.fetchPost(slug, isFirstView);
        const postData = await response.json();

        let finalHTML = '';
        if (response.ok) {
            if (isFirstView) {
                viewedPosts.push(slug);
                localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
            }
            finalHTML = ui.renderPost(postData, slug);
            ui.setContentWithFade(contentEl, finalHTML, () => {
                document.getElementById('like-btn').addEventListener('click', () => likePostHandler(slug));
                if (sessionStorage.getItem("token")) {
                    document.getElementById('editBtn').addEventListener('click', () => showEditForm(slug));
                    document.getElementById('deleteBtn').addEventListener('click', () => deletePostHandler(slug));
                }
            });
        } else {
            const errorMessage = postData.message || response.status;
            finalHTML = `
                <div class="error">
                  <p>Couldn't load post: ${errorMessage}</p>
                  <button onclick="window.location.href = '/'">← Back to Posts</button>
                </div>
            `;
            ui.setContentWithFade(contentEl, finalHTML);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        const errorHTML = `
            <div class="error">
                <p>An error occurred: ${error.message}</p>
                <button onclick="window.location.href = '/'">← Back to Posts</button>
            </div>
        `;
        ui.setContentWithFade(contentEl, errorHTML);
    }
}

async function likePostHandler(slug) {
    const likeBtn = document.getElementById('like-btn');
    if (likeBtn.dataset.liked === 'true') {
        return;
    }

    try {
        const response = await api.likePost(slug);
        const responseData = await response.json();
        if (response.ok) {
            document.getElementById('likes-count').innerText = `Likes: ${responseData.likes}`;
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
            likedPosts.push(slug);
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            likeBtn.dataset.liked = 'true';
        } else {
            alert(`Error: ${responseData.error}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("An error occurred while liking the post.");
    }
}

export function showPostForm() {
    const formHTML = ui.renderPostForm();
    ui.setContentWithFade(contentEl, formHTML, () => {
        document.getElementById("newPostForm").addEventListener("submit", handlePostSubmission);
    });
}

async function handlePostSubmission(event) {
    event.preventDefault();
    const title = document.getElementById("postTitle").value;
    const by = document.getElementById("postBy").value;
    const markdownContent = document.getElementById("postContent").value;
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to post.");
        return;
    }

    try {
        const response = await api.createPost({ title, by, markdownContent }, token);
        const responseData = await response.json();

        if (response.ok) {
            loadPost(responseData.slug);
        } else {
            alert(`Error: ${responseData.error || response.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("An error occurred while creating the post.");
    }
}

async function showEditForm(slug) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to edit posts.");
        return;
    }

    try {
        const response = await api.fetchRawPost(slug, token);
        const postData = await response.json();

        if (response.ok) {
            const formHTML = ui.renderEditForm(postData, slug);
            ui.setContentWithFade(contentEl, formHTML, () => {
                document.getElementById("editPostForm").addEventListener("submit", (event) => handlePostUpdate(event, slug));
            });
        } else {
            alert(`Error: ${postData.error || response.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("An error occurred while fetching the post for editing.");
    }
}

async function handlePostUpdate(event, slug) {
    event.preventDefault();
    const title = document.getElementById("postTitle").value;
    const by = document.getElementById("postBy").value;
    const markdownContent = document.getElementById("postContent").value;
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to update posts.");
        return;
    }

    try {
        const response = await api.updatePost(slug, { title, by, markdownContent }, token);
        const responseData = await response.json();

        if (response.ok) {
            loadPost(responseData.slug);
        } else {
            alert(`Error: ${responseData.error || response.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("An error occurred while updating the post.");
    }
}

async function deletePostHandler(slug) {
    if (!confirm("Are you sure you want to delete this post?")) {
        return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to delete posts.");
        return;
    }

    try {
        const response = await api.deletePost(slug, token);
        if (response.ok) {
            window.location.href = '/';
        } else {
            const responseData = await response.json();
            alert(`Error: ${responseData.error || response.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("An error occurred while deleting the post.");
    }
}
