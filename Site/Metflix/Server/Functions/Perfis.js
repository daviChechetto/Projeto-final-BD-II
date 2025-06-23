const express = require('express');
const router = express.Router();
const db = require('../Database/DBConection');
const authenticateToken = require('./authMiddleware');
const { dbAll } = require('../Database/DBhelper');

// Rota para buscar todos os perfis de um usuário específico
// Exemplo de como chamar: /usuarios/1/perfis
router.get('/usuarios/:id_usuario/perfis', authenticateToken, async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const query = 'SELECT id_perfil, nome, avatar_url FROM Perfis WHERE id_usuario = ?';
        const perfis = dbAll(query, [id_usuario]);

        if (!perfis) {
            return res.status(404).json({ mensagem: 'Nenhum perfil encontrado para este usuário.' });
        }

        res.status(200).json(perfis);

    } catch (error) {
        console.error('Erro ao buscar perfis:', error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar perfis.' });
    }
});

module.exports = router;
