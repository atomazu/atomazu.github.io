function setContentWithFade(element, newHtml) {
  const hasContent = element.innerHTML.trim() !== '';

  if (hasContent) {
    element.classList.add('fade-out');
    
    element.addEventListener('transitionend', function handler() {
      element.innerHTML = newHtml;
      element.classList.remove('fade-out');
      element.removeEventListener('transitionend', handler);
    }, { once: true });
    
  } else {
    element.style.opacity = 0;
    element.innerHTML = newHtml;
    setTimeout(() => {
      element.style.opacity = 1;
    }, 10);  }
}

const BASE_URL = "https://api.atomazu.org/";

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("postBtn").innerHTML = "";

  const urlParams = new URLSearchParams(window.location.search);
  const postSlug = urlParams.get('post');
  
  if (postSlug) {
    loadPost(postSlug);
  } else {
    getPosts();
  }
});

async function getPosts() {
  const contentEl = document.getElementById("content");
  try {
    contentEl.innerHTML = '<p id="loadElm" class="loading-symbol">ᕕ(ᐛ)ᕗ</p>';

    const response = await fetch(BASE_URL + "posts", {
      method: 'GET'
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      const postsHTML = responseData.map(post => 
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
      
      setContentWithFade(contentEl, postsHTML);
    } else {
      const errorMessage = responseData.message || response.status;
      const errorHTML = `<p class="error">Couldn't load posts: ${errorMessage}</p>`;
      setContentWithFade(contentEl, errorHTML);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    const errorHTML = `<p class="error">An error occurred during the request: ${error.message}</p>`;
    setContentWithFade(contentEl, errorHTML);
  }
}

async function loadPost(slug) {
  const contentEl = document.getElementById("content");
  try {
    contentEl.innerHTML = '<p id="loadElm" class="loading-symbol">ᕕ(ᐛ)ᕗ</p>';

    const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts')) || [];
    const isFirstView = !viewedPosts.includes(slug);
    
    const response = await fetch(BASE_URL + `posts/${slug}?first_view=${isFirstView}`, {
      method: 'GET'
    });
    
    const postData = await response.json();
    
    let finalHTML = '';
    if (response.ok) {
      if (isFirstView) {
        viewedPosts.push(slug);
        localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
      }

      const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
      const isLiked = likedPosts.includes(slug);

      finalHTML = `
        <button class="back-button" onclick="window.location.href = '/'">← Back to Posts</button>
        <article>
          <div class="title-container">
            <h1>${postData.title}</h1>
            <span id="like-btn" class="like-btn" onclick="likePost('${slug}')" data-liked="${isLiked}"></span>
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
    } else {
      const errorMessage = postData.message || response.status;
      finalHTML = `
        <div class="error">
          <p>Couldn't load post: ${errorMessage}</p>
          <button onclick="window.location.href = '/'">← Back to Posts</button>
        </div>
      `;
    }
    
    setContentWithFade(contentEl, finalHTML);

  } catch (error) {
    console.error("An error occurred:", error);
    const errorHTML = `
      <div class="error">
        <p>An error occurred: ${error.message}</p>
        <button onclick="window.location.href = '/'">← Back to Posts</button>
      </div>
    `;
    setContentWithFade(contentEl, errorHTML);
  }
}

async function likePost(slug) {
    const likeBtn = document.getElementById('like-btn');
    if (likeBtn.dataset.liked === 'true') {
        return;
    }

    try {
        const response = await fetch(BASE_URL + `posts/${slug}/like`, {
            method: 'POST'
        });
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

document.getElementById("loginBtn").addEventListener("click", async function(event) {
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

  // const VALIDATE_URL = 'http://localhost:3000/auth/validate';
  const VALIDATE_URL = 'https://api.atomazu.org/auth/validate';
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(VALIDATE_URL, {
      method: 'GET',
      headers: headers
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      sessionStorage.setItem("token", token);
      document.getElementById("loginBtn").innerHTML = "Logout"
      document.getElementById("postBtn").innerHTML = "Post";
    } else {
      const errorMessage = responseData.message || response.status;
      alert(`Authentication failed: ${errorMessage}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert(`An error occurred during the request: ${error.message}`);
  }
});
