const express = require('express');
const router = express.Router();
// CORREÇÃO: Importando todas as funções necessárias do DBhelper
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../../Database/DBhelper');
const authenticateToken = require('../authMiddleware');
const adminOnly = require('./adminOnly');

const protectedAdminRoute = [authenticateToken, adminOnly];

// --- ROTAS PÚBLICAS (para a Home Page) ---

router.get('/browse', async (req, res) => {
    try {
        const heroSql = `SELECT * FROM Conteudos ORDER BY RANDOM() LIMIT 1;`;
        const heroContent = await dbGetAsync(heroSql);

        const moviesSql = `SELECT * FROM Conteudos WHERE tipo_conteudo = 'filme' ORDER BY ano_lancamento DESC LIMIT 15;`;
        const movies = await dbAllAsync(moviesSql);

        const seriesSql = `SELECT * FROM Conteudos WHERE tipo_conteudo = 'serie' ORDER BY ano_lancamento DESC LIMIT 15;`;
        const series = await dbAllAsync(seriesSql);

        res.status(200).json({
            heroContent,
            rows: [
                { title: 'Filmes Populares', contents: movies },
                { title: 'Séries em Destaque', contents: series }
            ]
        });
    } catch (error) {
        res.status(500).json({ mensagem: 'Não foi possível carregar o conteúdo.' });
    }
});

router.get('/generos', async (req, res) => {
    try {
        const generos = await dbAllAsync('SELECT * FROM Generos ORDER BY nome');
        res.status(200).json(generos);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

// --- ROTAS DE ADMINISTRAÇÃO ---

// LISTAR CONTEÚDOS PARA O PAINEL
router.get('/conteudos', protectedAdminRoute, async (req, res) => {
    try {
        const conteudos = await dbAllAsync('SELECT * FROM Conteudos ORDER BY titulo');
        res.status(200).json(conteudos);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao listar conteúdos.' });
    }
});

// BUSCAR UM CONTEÚDO (com seus gêneros e episódios, se for série)
router.get('/conteudos/:id', protectedAdminRoute, async (req, res) => {
    const { id } = req.params;
    try {
        const conteudo = await dbGetAsync('SELECT * FROM Conteudos WHERE id_conteudo = ?', [id]);
        if (!conteudo) return res.status(404).json({ mensagem: 'Conteúdo não encontrado' });

        const generos = await dbAllAsync('SELECT id_genero FROM Conteudo_Genero WHERE id_conteudo = ?', [id]);
        conteudo.genero_ids = generos.map(g => g.id_genero);
        
        // Se for uma série, busca também os episódios
        if (conteudo.tipo_conteudo === 'serie') {
            const episodios = await dbAllAsync('SELECT * FROM Episodios WHERE id_conteudo = ? ORDER BY numero_temporada, numero_episodio', [id]);
            conteudo.episodios = episodios;
        }

        res.status(200).json(conteudo);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor' });
    }
});


// CRIAR CONTEÚDO (Série ou Filme) E SEUS EPISÓDIOS EM UMA TRANSAÇÃO
router.post('/conteudos', protectedAdminRoute, async (req, res) => {
    // Agora esperamos um array 'episodios' no body se for uma série
    const { titulo, descricao, tipo_conteudo, genero_ids = [], episodios = [], ...outrosCampos } = req.body;

    if (!titulo || !tipo_conteudo) {
        return res.status(400).json({ mensagem: 'Título e Tipo são obrigatórios.' });
    }

    try {
        await dbRunAsync("BEGIN TRANSACTION;");

        const sqlConteudo = `INSERT INTO Conteudos (titulo, descricao, tipo_conteudo, ano_lancamento, duracao_min, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await dbRunAsync(sqlConteudo, [titulo, descricao, tipo_conteudo, outrosCampos.ano_lancamento, outrosCampos.duracao_min, outrosCampos.thumbnail_url]);
        const newContentId = result.lastID;

        // Inserir os gêneros
        if (genero_ids.length > 0) {
            const sqlGenero = 'INSERT INTO Conteudo_Genero (id_conteudo, id_genero) VALUES (?, ?)';
            for (const id_genero of genero_ids) {
                await dbRunAsync(sqlGenero, [newContentId, id_genero]);
            }
        }

        // Se for uma série e tiver episódios, insere-os
        if (tipo_conteudo === 'serie' && episodios.length > 0) {
            const sqlEpisodio = `INSERT INTO Episodios (id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url) VALUES (?, ?, ?, ?, ?, ?)`;
            for (const ep of episodios) {
                await dbRunAsync(sqlEpisodio, [newContentId, ep.titulo, ep.numero_temporada, ep.numero_episodio, ep.duracao_min, ep.video_url]);
            }
        }

        await dbRunAsync("COMMIT;");
        res.status(201).json({ id_conteudo: newContentId, ...req.body });

    } catch (error) {
        await dbRunAsync("ROLLBACK;");
        console.error('Erro ao criar conteúdo:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});


// ATUALIZAR CONTEÚDO (e seus episódios)
router.put('/conteudos/:id', protectedAdminRoute, async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, tipo_conteudo, genero_ids = [], episodios = [], ...outrosCampos } = req.body;
    
    try {
        await dbRunAsync("BEGIN TRANSACTION;");

        const sqlUpdate = `UPDATE Conteudos SET titulo = ?, descricao = ?, tipo_conteudo = ?, ano_lancamento = ?, duracao_min = ?, thumbnail_url = ? WHERE id_conteudo = ?`;
        await dbRunAsync(sqlUpdate, [titulo, descricao, tipo_conteudo, outrosCampos.ano_lancamento, outrosCampos.duracao_min, outrosCampos.thumbnail_url, id]);

        // Atualiza Gêneros (apaga os antigos e insere os novos)
        await dbRunAsync('DELETE FROM Conteudo_Genero WHERE id_conteudo = ?', [id]);
        if (genero_ids.length > 0) {
            const sqlGenero = 'INSERT INTO Conteudo_Genero (id_conteudo, id_genero) VALUES (?, ?)';
            for (const id_genero of genero_ids) {
                await dbRunAsync(sqlGenero, [id, id_genero]);
            }
        }

        // Atualiza Episódios (apaga os antigos e insere os novos)
        await dbRunAsync('DELETE FROM Episodios WHERE id_conteudo = ?', [id]);
        if (tipo_conteudo === 'serie' && episodios.length > 0) {
            const sqlEpisodio = `INSERT INTO Episodios (id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url) VALUES (?, ?, ?, ?, ?, ?)`;
            for (const ep of episodios) {
                await dbRunAsync(sqlEpisodio, [id, ep.titulo, ep.numero_temporada, ep.numero_episodio, ep.duracao_min, ep.video_url]);
            }
        }
        
        await dbRunAsync("COMMIT;");
        res.status(200).json({ mensagem: 'Conteúdo atualizado com sucesso.' });

    } catch (error) {
        await dbRunAsync("ROLLBACK;");
        res.status(500).json({ mensagem: 'Erro ao atualizar conteúdo.' });
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