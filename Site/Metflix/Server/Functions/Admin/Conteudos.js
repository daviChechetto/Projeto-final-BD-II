// Server/Functions/Admin/Conteudos.js

const express = require('express');
const router = express.Router();
const db = require('../../Database/DBConection'); // Importa a conexão para usar transações
// CORREÇÃO: Importando os helpers SÍNCRONOS e corretos do better-sqlite3
const { dbGet, dbAll, dbRun } = require('../../Database/DBhelper');
const authenticateToken = require('../authMiddleware');
const adminOnly = require('./adminOnly');

const protectedAdminRoute = [authenticateToken, adminOnly];

// --- ROTAS PÚBLICAS (NÃO PRECISAM DE ASYNC/AWAIT PARA O BANCO) ---

router.get('/browse', (req, res) => {
    try {
        // CORREÇÃO: Chamadas síncronas diretas, sem 'await'
        const heroSql = `SELECT * FROM Conteudos ORDER BY RANDOM() LIMIT 1;`;
        const heroContent = dbGet(heroSql);

        const moviesSql = `SELECT * FROM Conteudos WHERE tipo_conteudo = 'filme' ORDER BY ano_lancamento DESC LIMIT 15;`;
        const movies = dbAll(moviesSql);

        const seriesSql = `SELECT * FROM Conteudos WHERE tipo_conteudo = 'serie' ORDER BY ano_lancamento DESC LIMIT 15;`;
        const series = dbAll(seriesSql);

        res.status(200).json({
            heroContent,
            rows: [
                { title: 'Filmes Populares', contents: movies },
                { title: 'Séries em Destaque', contents: series }
            ]
        });
    } catch (error) {
        console.error("Falha ao buscar dados do browse:", error.message);
        res.status(500).json({ mensagem: 'Não foi possível carregar o conteúdo.' });
    }
});

router.get('/generos', (req, res) => {
    try {
        const generos = dbAll('SELECT * FROM Generos ORDER BY nome');
        res.status(200).json(generos);
    } catch (error) {
        console.error('Erro ao listar generos:', error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});


// --- ROTAS DE ADMINISTRAÇÃO (PADRÃO SÍNCRONO) ---

// LISTAR CONTEÚDOS PARA O PAINEL
router.get('/conteudos', protectedAdminRoute, (req, res) => {
    try {
        const conteudos = dbAll('SELECT * FROM Conteudos ORDER BY titulo');
        res.status(200).json(conteudos);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao listar conteúdos.' });
    }
});

// BUSCAR UM CONTEÚDO ESPECÍFICO
router.get('/conteudos/:id', protectedAdminRoute, (req, res) => {
    const { id } = req.params;
    try {
        const conteudo = dbGet('SELECT * FROM Conteudos WHERE id_conteudo = ?', [id]);
        if (!conteudo) return res.status(404).json({ mensagem: 'Conteúdo não encontrado' });

        const generos = dbAll('SELECT id_genero FROM Conteudo_Genero WHERE id_conteudo = ?', [id]);
        conteudo.genero_ids = generos.map(g => g.id_genero);
        
        if (conteudo.tipo_conteudo === 'serie') {
            const episodios = dbAll('SELECT * FROM Episodios WHERE id_conteudo = ? ORDER BY numero_temporada, numero_episodio', [id]);
            conteudo.episodios = episodios;
        }

        res.status(200).json(conteudo);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor' });
    }
});


// CRIAR CONTEÚDO (COM TRANSAÇÃO CORRETA)
router.post('/conteudos', protectedAdminRoute, (req, res) => {
    const { titulo, descricao, tipo_conteudo, genero_ids = [], episodios = [], ...outrosCampos } = req.body;

    if (!titulo || !tipo_conteudo) {
        return res.status(400).json({ mensagem: 'Título e Tipo são obrigatórios.' });
    }

    const createContentTransaction = db.transaction((data) => {
        const sqlConteudo = `INSERT INTO Conteudos (titulo, descricao, tipo_conteudo, ano_lancamento, duracao_min, thumbnail_url) VALUES (@titulo, @descricao, @tipo_conteudo, @ano_lancamento, @duracao_min, @thumbnail_url)`;
        const info = db.prepare(sqlConteudo).run(data);
        const newContentId = info.lastInsertRowid;

        if (!newContentId) throw new Error("Não foi possível obter o ID do novo conteúdo.");

        if (data.genero_ids.length > 0) {
            const stmt = db.prepare('INSERT INTO Conteudo_Genero (id_conteudo, id_genero) VALUES (?, ?)');
            for (const id_genero of data.genero_ids) stmt.run(newContentId, id_genero);
        }
        
        if (data.tipo_conteudo === 'serie' && data.episodios.length > 0) {
            const stmt = db.prepare(`INSERT INTO Episodios (id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url) VALUES (?, ?, ?, ?, ?, ?)`);
            for (const ep of data.episodios) stmt.run(newContentId, ep.titulo, ep.numero_temporada, ep.numero_episodio, ep.duracao_min, ep.video_url);
        }
        return { id: newContentId };
    });

    try {
        const result = createContentTransaction({ titulo, descricao, tipo_conteudo, genero_ids, episodios, ...outrosCampos });
        res.status(201).json({ id_conteudo: result.id, ...req.body });
    } catch (error) {
        console.error('Erro ao criar conteúdo:', error.message);
        res.status(500).json({ mensagem: 'Erro na transação. Nenhuma alteração foi salva.' });
    }
});


// ATUALIZAR CONTEÚDO (COM TRANSAÇÃO CORRETA)
router.put('/conteudos/:id', protectedAdminRoute, (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, tipo_conteudo, genero_ids = [], episodios = [], ...outrosCampos } = req.body;
    
    const updateContentTransaction = db.transaction((data) => {
        const sqlUpdate = `UPDATE Conteudos SET titulo = @titulo, descricao = @descricao, tipo_conteudo = @tipo_conteudo, ano_lancamento = @ano_lancamento, duracao_min = @duracao_min, thumbnail_url = @thumbnail_url WHERE id_conteudo = @id`;
        db.prepare(sqlUpdate).run(data);

        db.prepare('DELETE FROM Conteudo_Genero WHERE id_conteudo = ?').run(data.id);
        if (data.genero_ids.length > 0) {
            const stmt = db.prepare('INSERT INTO Conteudo_Genero (id_conteudo, id_genero) VALUES (?, ?)');
            for (const id_genero of data.genero_ids) stmt.run(data.id, id_genero);
        }

        db.prepare('DELETE FROM Episodios WHERE id_conteudo = ?').run(data.id);
        if (data.tipo_conteudo === 'serie' && data.episodios.length > 0) {
            const stmt = db.prepare(`INSERT INTO Episodios (id_conteudo, titulo, numero_temporada, numero_episodio, duracao_min, video_url) VALUES (?, ?, ?, ?, ?, ?)`);
            for (const ep of data.episodios) stmt.run(data.id, ep.titulo, ep.numero_temporada, ep.numero_episodio, ep.duracao_min, ep.video_url);
        }
    });

    try {
        updateContentTransaction({ id, titulo, descricao, tipo_conteudo, genero_ids, episodios, ...outrosCampos });
        res.status(200).json({ mensagem: 'Conteúdo atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar conteúdo:', error.message);
        res.status(500).json({ mensagem: 'Erro na transação de atualização.' });
    }
});


// DELETAR UM CONTEÚDO
router.delete('/conteudos/:id', protectedAdminRoute, (req, res) => {
    const { id } = req.params;
    try {
        const info = dbRun('DELETE FROM Conteudos WHERE id_conteudo = ?', [id]);
        if (info.changes === 0) {
            return res.status(404).json({ mensagem: 'Conteúdo não encontrado.' });
        }
        res.status(200).json({ mensagem: 'Conteúdo excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir conteúdo:', error.message);
        res.status(500).json({ mensagem: 'Erro ao excluir conteúdo.' });
    }
});

module.exports = router;