const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userId = await User.register({ username, email, password });

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            userId: userId.toHexString()
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Erro ao registrar usuário'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.authenticate(username, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        req.session.userId = user._id.toHexString();
        req.session.username = user.username;

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            user: {
                id: user._id.toHexString(),
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao fazer login'
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao fazer logout'
            });
        }

        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    });
});

router.get('/me', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                error: 'Não autenticado'
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar usuário'
        });
    }
});

module.exports = router;
