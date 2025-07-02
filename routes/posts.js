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
        }));
        res.json(summaries);
    });

    router.get('/:slug', (req, res) => {
        const { slug } = req.params;
        const allPosts = getPosts();
        const post = allPosts.find(p => p.slug === slug);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const htmlContent = marked.parse(post.markdownContent);
        res.json({
            slug: post.slug,
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

        const newSlug = slugify(title);
        const newFilePath = path.join(POSTS_DIR, `${newSlug}.md`);

        if (fs.existsSync(newFilePath)) {
            return res.status(409).json({ error: `A post with slug '${newSlug}' already exists.` });
        }

        const newPostData = { title, by, date: new Date().toISOString() };
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
