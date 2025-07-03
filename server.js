const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const createPostsRouter = require('./routes/posts');
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.error("TOKEN environment variable is required!");
    process.exit(1);
}
const POSTS_DIR = path.join(__dirname, 'posts');

if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR);
}

app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    next();
};

app.get('/auth/validate', authMiddleware, (req, res) => {
    res.status(200).json({ valid: true, message: 'Token is valid' });
});

const postsRouter = createPostsRouter({ authMiddleware, POSTS_DIR });
app.use('/posts', postsRouter);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
    console.log('API endpoints are available under /api/posts');
    console.log('Token validation endpoint is available at GET /api/auth/validate');
});
