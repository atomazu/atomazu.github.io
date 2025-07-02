const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const createRouter = ({ authMiddleware, POSTS_DIR }) => {
    const router = express.Router();

    const slugify = (text) =>
        text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')    
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-'); 

    const getPosts = () => {
        const files = fs.readdirSync(POSTS_DIR);
        const posts = files
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const filePath = path.join(POSTS_DIR, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const { data, content } = matter(fileContent);
                const slug = path.basename(file, '.md');
                return {
                    slug,
                    title: data.title,
                    date: data.date,
                    by: data.by,
                    likes: data.likes || 0,
                    views: data.views || 0,
                    markdownContent: content
                };
            });
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    router.get('/', (req, res) => {
        const allPosts = getPosts();
        const summaries = allPosts.map(post => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            by: post.by,
            likes: post.likes,
            views: post.views,
        }));
        res.json(summaries);
    });

    router.get('/:slug', (req, res) => {
        const { slug } = req.params;
        const { first_view } = req.query;
        const filePath = path.join(POSTS_DIR, `${slug}.md`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        if (first_view === 'true') {
            data.views = (data.views || 0) + 1;
            const updatedFileContent = matter.stringify(content, data);
            fs.writeFileSync(filePath, updatedFileContent, 'utf8');
        }

        const htmlContent = marked.parse(content);
        res.json({
            slug: slug,
            title: data.title,
            date: data.date,
            by: data.by,
            views: data.views,
            likes: data.likes || 0,
            content: htmlContent
        });
    });

    router.post('/:slug/like', (req, res) => {
        const { slug } = req.params;
        const { liked } = req.body;

        const filePath = path.join(POSTS_DIR, `${slug}.md`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        if (liked) {
            data.likes = (data.likes || 0) + 1;
        } else {
            data.likes = (data.likes || 1) - 1;
        }

        const updatedFileContent = matter.stringify(content, data);
        fs.writeFileSync(filePath, updatedFileContent, 'utf8');

        res.json({
            slug,
            likes: data.likes
        });
    });

    router.post('/', authMiddleware, (req, res) => {
        const { title, by, markdownContent } = req.body;
        if (!title || !by || !markdownContent) {
            return res.status(400).json({ error: 'Missing fields: title, by, markdownContent' });
        }

        const newSlug = slugify(title);
        const newFilePath = path.join(POSTS_DIR, `${newSlug}.md`);

        if (fs.existsSync(newFilePath)) {
            return res.status(409).json({ error: `A post with slug '${newSlug}' already exists.` });
        }

        const newPostData = { title, by, date: new Date().toISOString(), likes: 0, views: 0 };
        const fileContent = matter.stringify(markdownContent, newPostData);
        
        fs.writeFileSync(newFilePath, fileContent, 'utf8');

        const allPosts = getPosts();
        const createdPost = allPosts.find(p => p.slug === newSlug);
        
        res.status(201).json(createdPost);
    });

    router.put('/:slug', authMiddleware, (req, res) => {
        const { slug } = req.params;
        const allPosts = getPosts();
        const postToUpdate = allPosts.find(p => p.slug === slug);

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
            likes: postToUpdate.likes,
            views: postToUpdate.views,
        };
        
        const fileContent = matter.stringify(markdownContent, updatedFrontMatter);
        const filePath = path.join(POSTS_DIR, `${slug}.md`);

        fs.writeFileSync(filePath, fileContent, 'utf8');

        const updatedPosts = getPosts();
        const updatedPost = updatedPosts.find(p => p.slug === slug);

        res.json(updatedPost);
    });

    return router;
};

module.exports = createRouter;
