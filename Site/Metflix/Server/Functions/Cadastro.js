const express = require('express');
const argon2 = require('argon2');
const router = express.Router();
const db = require('../Database/DBConection');
const { dbGet, dbRun } = require('../Database/DBhelper');

router.post('/cadastro', async (req, res) => { // Mantemos async aqui por causa do argon2
    const { email, senha, id_plano, nome_perfil } = req.body;

    if (!email || !senha || !id_plano || !nome_perfil) {
        return res.status(400).json({ mensagem: 'Email, senha, plano e nome do perfil são obrigatórios.' });
    }

    try {
        // 1. VERIFICAR SE O EMAIL JÁ EXISTE (usando o helper síncrono)
        const userExists = dbGet('SELECT email FROM Usuarios WHERE email = ?', [email]);
        if (userExists) {
            return res.status(409).json({ mensagem: 'Este email já está cadastrado.' });
        }

        // 2. VERIFICAR SE O PLANO ESCOLHIDO É VÁLIDO
        const planExists = dbGet('SELECT id_plano FROM Planos WHERE id_plano = ?', [id_plano]);
        if (!planExists) {
            return res.status(404).json({ mensagem: 'Plano selecionado não é válido.' });
        }

        // 3. GERAR O HASH DA SENHA (esta parte continua assíncrona)
        const senha_hash = await argon2.hash(senha, { type: argon2.argon2id });
        
        // 4. USAR db.transaction para uma operação segura e atômica
        const createNewUser = db.transaction((params) => {
            // Inserir o usuário
            const userInsertSql = `
                INSERT INTO Usuarios (email, senha_hash, id_plano, data_modificado)
                VALUES (@email, @senha_hash, @id_plano, datetime('now'))
            `;
            const info = db.prepare(userInsertSql).run(params);
            
            // CORREÇÃO: A propriedade correta no 'better-sqlite3' é 'lastInsertRowid'
            const newUserId = info.lastInsertRowid;

            // Inserir o primeiro perfil associado
            const profileInsertSql = 'INSERT INTO Perfis (id_usuario, nome) VALUES (?, ?)';
            db.prepare(profileInsertSql).run(newUserId, params.nome_perfil);

            // A transação retorna o ID do novo usuário
            return newUserId;
        });

        // 5. Executar a transação
        const newUserId = createNewUser({ email, senha_hash, id_plano, nome_perfil });

        // 6. Enviar a resposta de sucesso
        return res.status(201).json({
            mensagem: 'Usuário e perfil inicial criados com sucesso!',
            usuario: { id_usuario: newUserId, email: email }
        });

    } catch (error) {
        // Se qualquer parte da transação falhar, o better-sqlite3 faz o ROLLBACK automaticamente.
        // Se o erro for de constraint, ele será capturado aqui.
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
             return res.status(409).json({ mensagem: 'Este email já está cadastrado.' });
        }
        
        console.error('Erro no processo de cadastro:', error);
        return res.status(500).json({ mensagem: 'Erro interno no servidor ao realizar o cadastro.' });
    }
});

module.exports = router;