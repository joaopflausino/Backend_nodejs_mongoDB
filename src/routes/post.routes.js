const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        const postData = {
            userId: req.session.userId,
            content: content
        };

        const post = new Post(postData);
        const postId = await post.save();

        res.status(201).json({
            success: true,
            postId: postId.toHexString()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Erro ao criar post'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.getAllPosts();

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar posts'
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const searchText = req.query.q;

        if (!searchText) {
            return res.status(400).json({
                success: false,
                error: 'Parâmetro "q" é obrigatório'
            });
        }

        const posts = await Post.searchByContent(searchText);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar posts'
        });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Post.findByUserId(req.params.userId);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar posts'
        });
    }
});

router.get('/sentiment/:sentiment', async (req, res) => {
    try {
        const posts = await Post.findBySentiment(req.params.sentiment);

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar posts'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post não encontrado'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar post'
        });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post não encontrado'
            });
        }

        if (post.userId.toHexString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para deletar este post'
            });
        }

        const deleted = await Post.deleteById(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Post não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Post deletado com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao deletar post'
        });
    }
});

module.exports = router;
