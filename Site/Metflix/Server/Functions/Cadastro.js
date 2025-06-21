const express = require('express');
const argon2 = require('argon2');
const router = express.Router();
const db = require('../Database/DBConection');
const { dbGetAsync, dbRunAsync } = require('../Database/DBhelper');

router.post('/cadastro', async (req, res) => {
    const { email, senha, id_plano, nome_perfil } = req.body;

    if (!email || !senha || !id_plano || !nome_perfil) {
        return res.status(400).json({ mensagem: 'Email, senha, plano e nome do perfil são obrigatórios.' });
    }

    try {
        // 1. VERIFICAR SE O EMAIL JÁ EXISTE
        const userExists = await dbGetAsync('SELECT email FROM Usuarios WHERE email = ?', [email]);
        if (userExists) {
            return res.status(409).json({ mensagem: 'Este email já está cadastrado.' });
        }

        // 2. VERIFICAR SE O PLANO ESCOLHIDO É VÁLIDO
        const planExists = await dbGetAsync('SELECT id_plano FROM Planos WHERE id_plano = ?', [id_plano]);
        if (!planExists) {
            return res.status(404).json({ mensagem: 'Plano selecionado não é válido.' });
        }

        // 3. GERAR O HASH DA SENHA
        const senha_hash = await argon2.hash(senha, { type: argon2.argon2id });
        
        // 4. INICIAR TRANSAÇÃO MANUALMENTE
        await dbRunAsync("BEGIN TRANSACTION;");

        // 5. INSERIR USUÁRIO
        const userInsertSql = `
            INSERT INTO Usuarios (email, senha_hash, id_plano, data_modificado)
            VALUES (?, ?, ?, datetime('now'))
        `;
        // O resultado do dbRunAsync contém o 'lastID'
        const userResult = await dbRunAsync(userInsertSql, [email, senha_hash, id_plano]);
        const newUserId = userResult.lastID;

        // 6. INSERIR PERFIL INICIAL
        const profileInsertSql = `
            INSERT INTO Perfis (id_usuario, nome) VALUES (?, ?);
        `;
        await dbRunAsync(profileInsertSql, [newUserId, nome_perfil]);

        // 7. SE TUDO DEU CERTO, COMMITAR A TRANSAÇÃO
        await dbRunAsync("COMMIT;");
        
        // 8. ENVIAR RESPOSTA DE SUCESSO
        return res.status(201).json({
            mensagem: 'Usuário e perfil inicial criados com sucesso!',
            usuario: { id_usuario: newUserId, email: email }
        });

    } catch (error) {
        // 9. SE QUALQUER PASSO FALHAR, FAZER ROLLBACK
        await dbRunAsync("ROLLBACK;");
        console.error('Erro no processo de cadastro:', error);
        return res.status(500).json({ mensagem: 'Erro interno no servidor ao realizar o cadastro.' });
    }
});

module.exports = router;