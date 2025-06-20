const express = require('express');
const argon2 = require('argon2');
const router = express.Router();
const db = require('../Database/DBConection');

function dbGetAsync(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Erro na consulta db.get:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

router.post('/cadastro', async (req, res) => {
    // Agora esperamos o id_plano e o nome_perfil, como no modelo Netflix.
    const { email, senha, id_plano, nome_perfil } = req.body;

    // Validação dos campos essenciais.
    if (!email || !senha || !id_plano || !nome_perfil) {
        return res.status(400).json({ mensagem: 'Email, senha, plano e nome do perfil são obrigatórios.' });
    }

    try {
        // 1. VERIFICAR SE O EMAIL JÁ EXISTE na tabela Usuarios.
        const userExists = await dbGetAsync('SELECT email FROM Usuarios WHERE email = ?', [email]);
        if (userExists) {
            return res.status(409).json({ mensagem: 'Este email já está cadastrado.' });
        }

        // 2. VERIFICAR SE O PLANO ESCOLHIDO É VÁLIDO.
        const planExists = await dbGetAsync('SELECT id_plano FROM Planos WHERE id_plano = ?', [id_plano]);
        if (!planExists) {
            return res.status(404).json({ mensagem: 'Plano selecionado não é válido.' });
        }

        // 3. GERAR O HASH DA SENHA.
        const senha_hash = await argon2.hash(senha, { type: argon2.argon2id });

        // 4. USAR db.serialize PARA EXECUTAR AS OPERAÇÕES EM ORDEM (TRANSAÇÃO).
        // db.serialize garante que os comandos dentro dela rodem em sequência.
        db.serialize(async () => {
            // Inicia a transação
            db.run("BEGIN TRANSACTION;");

            const userInsertSql = `
                INSERT INTO Usuarios (email, senha_hash, id_plano, data_modificado)
                VALUES (?, ?, ?, datetime('now'))
            `;

            // Roda o insert do usuário. O 'function(err)' é crucial para obter o 'this.lastID'.
            db.run(userInsertSql, [email, senha_hash, id_plano], async function(err) {
                if (err) {
                    console.error('Erro ao inserir usuário:', err.message);
                    db.run("ROLLBACK;"); // Desfaz a transação em caso de erro
                    return res.status(500).json({ mensagem: 'Erro ao criar usuário.' });
                }

                // 'this.lastID' contém o ID do usuário que acabamos de criar.
                const newUserId = this.lastID;

                const profileInsertSql = `
                    INSERT INTO Perfis (id_usuario, nome) VALUES (?, ?);
                `;

                // Insere o primeiro perfil associado ao novo usuário.
                db.run(profileInsertSql, [newUserId, nome_perfil], (err) => {
                    if (err) {
                        console.error('Erro ao inserir perfil:', err.message);
                        db.run("ROLLBACK;");
                        return res.status(500).json({ mensagem: 'Erro ao criar perfil de usuário.' });
                    }

                    // Se tudo deu certo, comita a transação.
                    db.run("COMMIT;");

                    // Envia a resposta de sucesso.
                    return res.status(201).json({
                        mensagem: 'Usuário e perfil inicial criados com sucesso!',
                        usuario: { id_usuario: newUserId, email: email }
                    });
                });
            });
        });

    } catch (error) {
        console.error('Erro no processo de cadastro:', error);
        return res.status(500).json({ mensagem: 'Erro interno no servidor ao realizar o cadastro.' });
    }
});

module.exports = router;
