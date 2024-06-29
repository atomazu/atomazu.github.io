let blogPosts = [];

function fetchBlogIndex() {
  return fetch("/assets/posts/blog-index.json")
    .then((response) => response.json())
    .then((data) => {
      blogPosts = data;
      return data;
    });
}

function loadPost(filename) {
  fetch(`/posts/${filename}`)
    .then((response) => response.text())
    .then((markdown) => {
      const content = marked.parse(markdown);
      document.getElementById("post-container").innerHTML = content;
    })
    .catch((error) => {
      console.error("Error loading post:", error);
      const errorTemplate = document.getElementById("error-template");
      document.getElementById("post-container").innerHTML =
        errorTemplate.innerHTML;
    });
}

function handlePostLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const postFile = urlParams.get("post");
  if (postFile) {
    loadPost(postFile);
  } else {
    window.location.href = "/src/html/blog.html";
  }
}

document.addEventListener("DOMContentLoaded", handlePostLoad);
