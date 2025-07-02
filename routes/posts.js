const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const createRouter = ({ authMiddleware, POSTS_DIR }) => {
    const router = express.Router();

    const getPosts = () => {
        const files = fs.readdirSync(POSTS_DIR);
        const posts = files
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const filePath = path.join(POSTS_DIR, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const { data, content } = matter(fileContent);
                const id = parseInt(path.basename(file, '.md'), 10);
                return {
                    id,
                    title: data.title,
                    date: data.date,
                    by: data.by,
                    markdownContent: content
                };
            });
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    router.get('/', (req, res) => {
        const allPosts = getPosts();
        const summaries = allPosts.map(post => ({
            id: post.id,
            title: post.title,
            date: post.date,
            by: post.by,
        }));
        res.json(summaries);
    });

    router.get('/:id', (req, res) => {
        const postId = parseInt(req.params.id, 10);
        const allPosts = getPosts();
        const post = allPosts.find(p => p.id === postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const htmlContent = marked.parse(post.markdownContent);
        res.json({
            id: post.id,
            title: post.title,
            date: post.date,
            by: post.by,
            content: htmlContent
        });
    });

    router.post('/', authMiddleware, (req, res) => {
        const { title, by, markdownContent } = req.body;
        if (!title || !by || !markdownContent) {
            return res.status(400).json({ error: 'Missing fields: title, by, markdownContent' });
        }
        
        const allPosts = getPosts();
        const newId = allPosts.length > 0 ? Math.max(...allPosts.map(p => p.id)) + 1 : 1;
        const newPostData = { title, by, date: new Date().toISOString() };
        const fileContent = matter.stringify(markdownContent, newPostData);
        const newFilePath = path.join(POSTS_DIR, `${newId}.md`);

        fs.writeFileSync(newFilePath, fileContent, 'utf8');
        const createdPost = getPosts().find(p => p.id === newId);
        res.status(201).json(createdPost);
    });

    router.put('/:id', authMiddleware, (req, res) => {
        const postId = parseInt(req.params.id, 10);
        const allPosts = getPosts();
        const postToUpdate = allPosts.find(p => p.id === postId);

        if (!postToUpdate) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const { title, by, markdownContent } = req.body;
        if (!title || !by || !markdownContent) {
            return res.status(400).json({ error: 'Missing fields: title, by, markdownContent' });
        }

        const updatedFrontMatter = {
            title,
            by,
            date: postToUpdate.date,
        };
        
        const fileContent = matter.stringify(markdownContent, updatedFrontMatter);
        const filePath = path.join(POSTS_DIR, `${postId}.md`);

        fs.writeFileSync(filePath, fileContent, 'utf8');
        const updatedPost = getPosts().find(p => p.id === postId);
        res.json(updatedPost);
    });

    return router;
};

module.exports = createRouter;
