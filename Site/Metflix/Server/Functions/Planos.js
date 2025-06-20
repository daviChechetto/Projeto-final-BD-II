const express = require('express');
const router = express.Router();
const db = require('../Database/DBConection');

// Função auxiliar para rodar queries 'all' com async/await
function dbAllAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Erro na consulta db.all:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

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
