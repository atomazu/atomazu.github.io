const BASE_URL = "https://api.atomazu.org/";

export async function fetchPosts() {
    return fetch(`${BASE_URL}posts`);
}

export async function fetchPost(slug, isFirstView) {
    return fetch(`${BASE_URL}posts/${slug}?first_view=${isFirstView}`);
}

export async function likePost(slug) {
    return fetch(`${BASE_URL}posts/${slug}/like`, {
        method: 'POST'
    });
}

export async function createPost(postData, token) {
    return fetch(`${BASE_URL}posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
    });
}

export async function fetchRawPost(slug, token) {
    return fetch(`${BASE_URL}posts/${slug}/raw`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function updatePost(slug, postData, token) {
    return fetch(`${BASE_URL}posts/${slug}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
    });
}

export async function deletePost(slug, token) {
    return fetch(`${BASE_URL}posts/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function validateToken(token) {
    const VALIDATE_URL = `${BASE_URL}auth/validate`;
    return fetch(VALIDATE_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}
