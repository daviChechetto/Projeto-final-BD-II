// Server/Functions/Historico.js
const express = require('express');
const router = express.Router();
const { dbAllAsync } = require('../Database/DBhelper');
const authenticateToken = require('./authMiddleware');

// Rota para pegar o histórico de um perfil, usando a VIEW
router.get('/perfis/:id_perfil/continuar-assistindo', authenticateToken, (req, res) => {
    const { id_perfil } = req.params;

    // AQUI USAMOS A VIEW! A consulta fica super simples.
    // Filtramos para pegar apenas os conteúdos com progresso entre 1% e 95%
    const sql = `
        SELECT * FROM VW_HISTORICO_ASSISTIDO
        WHERE id_perfil = ? AND progresso_percentual BETWEEN 1 AND 95
        LIMIT 10;
    `;
    
    try {
        // Validação simples para garantir que o usuário só pode ver seu próprio histórico
        // Em um app real, você compararia o id_perfil com os perfis associados ao req.user.id_usuario
        
        const historico = dbAllAsync(sql, [id_perfil]);
        res.json(historico);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar histórico.' });
    }
});

module.exports = router;