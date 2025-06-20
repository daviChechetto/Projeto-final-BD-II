const express = require('express');
const router = express.Router();
const db = require('../Database/DBConection');

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

// Rota principal para buscar os dados da página de browse
router.get('/browse-data', async (req, res) => {
    try {
        // 1. Buscar um conteúdo aleatório para ser o "Herói" (destaque)
        const heroQuery = `
            SELECT id_conteudo, titulo, descricao, thumbnail_url
            FROM Conteudos
            ORDER BY RANDOM() LIMIT 1;
        `;
        const heroContent = await dbAllAsync(heroQuery);

        // 2. Buscar todos os gêneros
        const genresQuery = 'SELECT id_genero, nome FROM Generos;';
        const genres = await dbAllAsync(genresQuery);

        // 3. Para cada gênero, buscar os conteúdos associados
        const rowsPromise = genres.map(async (genre) => {
            const contentsQuery = `
                SELECT c.id_conteudo, c.titulo, c.thumbnail_url
                FROM Conteudos c
                JOIN Conteudo_Genero cg ON c.id_conteudo = cg.id_conteudo
                WHERE cg.id_genero = ?
                LIMIT 10;
            `;
            const conteudos = await dbAllAsync(contentsQuery, [genre.id_genero]);

            return {
                genero: genre.nome,
                conteudos: conteudos,
            };
        });

        // Espera todas as buscas de conteúdo por gênero terminarem
        const rows = await Promise.all(rowsPromise);

        // Filtra as fileiras que não têm conteúdo
        const finalRows = rows.filter(row => row.conteudos.length > 0);

        // 4. Enviar a resposta completa para o frontend
        res.status(200).json({
            heroContent: heroContent[0] || null, // Pega o primeiro (e único) item ou retorna nulo
            rows: finalRows
        });

    } catch (error) {
        console.error('Erro ao buscar dados para a página de browse:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor ao buscar conteúdos.' });
    }
});

module.exports = router;
