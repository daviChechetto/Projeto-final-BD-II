// Server/Functions/Interacoes.js

const express = require('express');
const router = express.Router();
// Usando as novas funções síncronas do better-sqlite3
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../Database/DBhelper'); 
const authenticateToken = require('./authMiddleware');

// ROTA PARA ADICIONAR/REMOVER UM ITEM DA "MINHA LISTA" (Toggle)
router.post('/perfis/:id_perfil/minha-lista', authenticateToken, (req, res) => {
    const { id_perfil } = req.params;
    const { id_conteudo } = req.body;

    if (!id_conteudo) {
        return res.status(400).json({ mensagem: 'ID do conteúdo é obrigatório.' });
    }

    try {
        const itemExistente = dbGetAsync(
            'SELECT * FROM Minha_Lista WHERE id_perfil = ? AND id_conteudo = ?',
            [id_perfil, id_conteudo]
        );

        if (itemExistente) {
            dbRunAsync('DELETE FROM Minha_Lista WHERE id_minha_lista = ?', [itemExistente.id_minha_lista]);
            res.status(200).json({ mensagem: 'Conteúdo removido da sua lista.' });
        } else {
            dbRunAsync('INSERT INTO Minha_Lista (id_perfil, id_conteudo) VALUES (?, ?)', [id_perfil, id_conteudo]);
            res.status(201).json({ mensagem: 'Conteúdo adicionado à sua lista.' });
        }
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
});


// ROTA PARA ADICIONAR UM ITEM AO HISTÓRICO (LÓGICA CORRIGIDA E SIMPLIFICADA)
router.post('/perfis/:id_perfil/historico', authenticateToken, (req, res) => {
    const { id_perfil } = req.params;
    const { id_conteudo, id_episodio = null } = req.body;

    if (!id_conteudo) {
        return res.status(400).json({ mensagem: 'ID do conteúdo é obrigatório.' });
    }

    try {
        // Passo 1: Verifica se já existe um registro para este item
        let sql_check;
        let params_check;

        if (id_episodio) {
            sql_check = 'SELECT id_historico FROM Historicos WHERE id_perfil = ? AND id_conteudo = ? AND id_episodio = ?';
            params_check = [id_perfil, id_conteudo, id_episodio];
        } else {
            sql_check = 'SELECT id_historico FROM Historicos WHERE id_perfil = ? AND id_conteudo = ? AND id_episodio IS NULL';
            params_check = [id_perfil, id_conteudo];
        }

        const itemExistente = dbGetAsync(sql_check, params_check);

        // Passo 2: Decide se vai ATUALIZAR ou INSERIR
        if (itemExistente) {
            // Se existe, apenas atualiza a data de visualização
            const sql_update = `UPDATE Historicos SET data_visualizacao = CURRENT_TIMESTAMP WHERE id_historico = ?`;
            dbRunAsync(sql_update, [itemExistente.id_historico]);
        } else {
            // Se não existe, insere um novo registro
            const sql_insert = `INSERT INTO Historicos (id_perfil, id_conteudo, id_episodio, progresso_seg) VALUES (?, ?, ?, 1)`;
            dbRunAsync(sql_insert, [id_perfil, id_conteudo, id_episodio]);
        }
        
        res.status(201).json({ mensagem: 'Histórico atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao adicionar ao histórico:', error.message);
        res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
});

// ... (O resto das rotas GET de Interacoes.js pode continuar igual, usando dbAllAsync)

router.get('/perfis/:id_perfil/minha-lista', authenticateToken, (req, res) => {
    const { id_perfil } = req.params;
    const sql = `SELECT VDC.* FROM Minha_Lista ML JOIN VW_DETALHES_CONTEUDO VDC ON ML.id_conteudo = VDC.id_conteudo WHERE ML.id_perfil = ? ORDER BY ML.data_adicao DESC;`;
    try {
        const lista = dbAllAsync(sql, [id_perfil]);
        res.status(200).json(lista);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar a lista.' });
    }
});

router.get('/perfis/:id_perfil/historico', authenticateToken, (req, res) => {
    const { id_perfil } = req.params;
    const sql = `SELECT * FROM VW_HISTORICO_ASSISTIDO WHERE id_perfil = ? LIMIT 50;`;
    try {
        const historico = dbAllAsync(sql, [id_perfil]);
        res.status(200).json(historico);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar o histórico.' });
    }
});


module.exports = router;