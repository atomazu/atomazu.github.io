import { state } from './state.js';

export function setContentWithFade(element, newHtml, callback) {
    const hasContent = element.innerHTML.trim() !== '';

    if (hasContent) {
        element.classList.add('fade-out');
        element.addEventListener('transitionend', function handler() {
            element.innerHTML = newHtml;
            element.classList.remove('fade-out');
            element.removeEventListener('transitionend', handler);
            if (callback) callback();
        }, { once: true });
    } else {
        element.style.opacity = 0;
        element.innerHTML = newHtml;
        setTimeout(() => {
            element.style.opacity = 1;
            if (callback) callback();
        }, 10);
    }
}

export function renderPostList(posts) {
    return posts.map(post =>
        `<div class="post-list" onclick="window.location.href = '?post=' + '${post.slug}'" style="cursor: pointer;">
           <div>
             <h3>${post.title}</h3>
             <div>
               <span>By: ${post.by}</span>
               <span>${post.date}</span>
             </div>
             <div>
                <span>Views: ${post.views}</span>
                <span>Likes: ${post.likes}</span>
             </div>
           </div>
         </div>`
    ).join('');
}

export function renderPost(postData, slug) {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
    const isLiked = likedPosts.includes(slug);

    const adminButtons = state.isLoggedIn ? `
          <button id="editBtn" class="action-button">Edit</button>
          <button id="deleteBtn" class="action-button">Delete</button>
    ` : '';

    return `
        <div class="action-buttons-container">
          <button class="action-button" onclick="window.location.href = '/'">Back</button>
          ${adminButtons}
        </div>
        <div class="post-header">
            <div class="title-container">
                <h1>${postData.title}</h1>
                <span id="like-btn" class="like-btn" data-liked="${isLiked}"></span>
            </div>
            <div class="post-meta">
                <span>By: ${postData.by}</span>
                <span>${postData.date}</span>
            </div>
            <div class="post-meta">
                <span>Views: ${postData.views}</span>
                <span id="likes-count">Likes: ${postData.likes}</span>
            </div>
        </div>
        <article>
          <div>
            ${postData.content}
          </div>
        </article>
    `;
}

export function renderPostForm() {
    return `
        <form id="newPostForm">
          <h2>Create a New Post</h2>
          <div class="form-group">
            <label for="postTitle">Title</label>
            <input type="text" id="postTitle" required>
          </div>
          <div class="form-group">
            <label for="postBy">Author</label>
            <input type="text" id="postBy" required>
          </div>
          <div class="form-group">
            <label for="postContent">Content (Markdown)</label>
            <textarea id="postContent" rows="15" required></textarea>
          </div>
          <button type="submit" class="action-button">Create Post</button>
        </form>
        <div class="action-buttons-container">
            <button class="action-button" onclick="window.location.href = '/'">← Back to Posts</button>
        </div>
    `;
}

export function renderEditForm(postData, slug) {
    return `
        <form id="editPostForm">
          <h2>Edit Post</h2>
          <div class="form-group">
            <label for="postTitle">Title</label>
            <input type="text" id="postTitle" value="${postData.title}" required>
          </div>
          <div class="form-group">
            <label for="postBy">Author</label>
            <input type="text" id="postBy" value="${postData.by}" required>
          </div>
          <div class="form-group">
            <label for="postContent">Content (Markdown)</label>
            <textarea id="postContent" rows="15" required>${postData.markdownContent}</textarea>
          </div>
          <button type="submit" class="action-button">Update Post</button>
        </form>
        <div class="action-buttons-container">
            <button class="action-button" onclick="window.location.href = '?post=${slug}'">← Cancel</button>
        </div>
    `;
}
