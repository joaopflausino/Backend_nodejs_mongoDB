const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, checkResourceOwnership } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const users = await User.getAllUsers();

        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json({
            success: true,
            data: usersWithoutPasswords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar usuários'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar usuário'
        });
    }
});

router.get('/email/:email', async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar usuário'
        });
    }
});

router.delete('/:id',
    authMiddleware,
    checkResourceOwnership(req => req.params.id),
    async (req, res) => {
        try {
            const deleted = await User.deleteById(req.params.id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuário não encontrado'
                });
            }

            req.session.destroy();

            res.json({
                success: true,
                message: 'Usuário deletado com sucesso'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao deletar usuário'
            });
        }
    }
);

module.exports = router;
