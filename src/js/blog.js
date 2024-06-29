let blogPosts = [];

function fetchBlogIndex() {
  return fetch("/posts/blog-index.json")
    .then((response) => response.json())
    .then((data) => {
      blogPosts = data;
      return data;
    });
}

function createPostElement(post) {
  const article = document.createElement("article");
  article.className = "blog-post fade-scroll";

  article.innerHTML = `
        <div class="card mb-3"><h2><a href="view-post.html?post=${post.file}">${
    post.title
  }</a></h2>
        <p class="post-meta">Published on ${post.date} | Tags: ${post.tags
    .map((tag) => `<span class="blog-tag">${tag}</span>`)
    .join(" ")}</p>
        <div class="post-content"></div></div>
    `;

  return article;
}

function showPostList() {
  const blogPostsContainer = document.getElementById("blog-posts");
  if (!blogPostsContainer) return;

  blogPostsContainer.innerHTML =
    '<div class="fade-scroll"><h1 class="mb-4">My Blog</h1></div>';
  blogPosts.forEach((post) => {
    blogPostsContainer.appendChild(createPostElement(post));
  });
}

function handleHashRedirect() {
  const hash = window.location.hash.slice(1);
  if (hash) {
    window.location.href = `/src/html/view-post.html?post=${hash}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchBlogIndex().then(() => {
    handleHashRedirect();
    showPostList();
  });
});

// Function to get recent posts (for use in index.html)
function getRecentPosts(count = 3) {
  return fetchBlogIndex().then((posts) => posts.slice(0, count));
}
