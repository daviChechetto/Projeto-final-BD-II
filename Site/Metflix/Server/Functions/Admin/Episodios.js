const express = require('express');
const router = express.Router();
const { dbAllAsync, dbRunAsync } = require('../../Database/DBhelper');
const authenticateToken = require('../authMiddleware');
const adminOnly = require('./adminOnly');

const protectedAdminRoute = [authenticateToken, adminOnly];

router.get('/conteudos/:id_conteudo/episodios', async (req, res) => {
    const { id_conteudo } = req.params;
    const sql = 'SELECT * FROM Episodios WHERE id_conteudo = ? ORDER BY numero_temporada, numero_episodio';
    try {
        const episodios = await dbAllAsync(sql, [id_conteudo]);
        res.json(episodios);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar episódios.' });
    }
});

// ADICIONAR NOVO EPISÓDIO
router.post('/episodios', protectedAdminRoute, async (req, res) => {
    const { id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url } = req.body;
    const sql = `INSERT INTO Episodios (id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    try {
        const result = await dbRunAsync(sql, [id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url]);
        res.status(201).json({ id_episodio: result.lastID, ...req.body });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao adicionar episódio.' });
    }
});

// ATUALIZAR UM EPISÓDIO
router.put('/episodios/:id_episodio', protectedAdminRoute, async (req, res) => {
    const { id_episodio } = req.params;
    const { titulo, numero_temporada, numero_episodio, duracao_min, video_url } = req.body;
    const sql = `UPDATE Episodios SET titulo = ?, numero_temporada = ?, numero_episodio = ?, duracao_min = ?, video_url = ? 
                 WHERE id_episodio = ?`;
    try {
        await dbRunAsync(sql, [titulo, numero_temporada, numero_episodio, duracao_min, video_url, id_episodio]);
        res.json({ mensagem: 'Episódio atualizado com sucesso.' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao atualizar episódio.' });
    }
});

// DELETAR UM EPISÓDIO
router.delete('/episodios/:id_episodio', protectedAdminRoute, async (req, res) => {
    const { id_episodio } = req.params;
    const sql = 'DELETE FROM Episodios WHERE id_episodio = ?';
    try {
        await dbRunAsync(sql, [id_episodio]);
        res.json({ mensagem: 'Episódio deletado com sucesso.' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao deletar episódio.' });
    }
});

module.exports = router;