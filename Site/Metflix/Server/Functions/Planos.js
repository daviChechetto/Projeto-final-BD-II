const express = require('express');
const router = express.Router();
const db = require('../Database/DBConection');
const { dbAllAsync } = require('../Database/DBhelper');

// Rota para buscar os dados dos planos
router.get('/planos', async (req, res) => {
    try {
        const plans = await dbAllAsync('SELECT id_plano, nome, preco, qualidade_max, telas_max FROM Planos ORDER BY preco;');
        res.status(200).json(plans);
    } catch (error) {
        console.error('Erro ao buscar planos:', error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar planos.' });
    }
});

module.exports = router;
