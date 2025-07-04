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

    const adminButtons = sessionStorage.getItem("token") ? `
        <div class="admin-buttons">
          <button id="editBtn">Edit</button>
          <button id="deleteBtn">Delete</button>
        </div>
    ` : '';

    return `
        <button class="back-button" onclick="window.location.href = '/'">← Back to Posts</button>
        ${adminButtons}
        <article>
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
          <div>
            ${postData.content}
          </div>
        </article>
    `;
}

export function renderPostForm() {
    return `
        <button class="back-button" onclick="window.location.href = '/'">← Back to Posts</button>
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
          <button type="submit">Create Post</button>
        </form>
    `;
}

export function renderEditForm(postData, slug) {
    return `
        <button class="back-button" onclick="window.location.href = '?post=${slug}'">← Cancel</button>
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
          <button type="submit">Update Post</button>
        </form>
    `;
}
