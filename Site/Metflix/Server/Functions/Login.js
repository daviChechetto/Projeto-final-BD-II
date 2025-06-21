const express = require('express');
const argon2 = require('argon2');
const router = express.Router();
const db = require('../Database/DBConection');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const { dbGetAsync, dbAllAsync } = require('../Database/DBhelper');  



router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Dados recebidos para login:', { email, senha });
    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        // 1. BUSCAR USUÁRIO PELO EMAIL na tabela Usuarios.
        const queryUser = 'SELECT id_usuario, email, senha_hash, is_admin FROM Usuarios WHERE email = ?';
        const userData = dbGetAsync(queryUser, [email]);
        console.log('Dados do usuário encontrado:', userData);
        // 2. VERIFICAR SE O USUÁRIO EXISTE.
        if (!userData) {
            return res.status(401).json({ mensagem: "Credenciais inválidas." });
        }

        // 3. VERIFICAR A SENHA com argon2.
        const senhaValida = argon2.verify(userData.senha_hash, senha);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: "Credenciais inválidas." });
        }

        const payload = { 
            id_usuario: userData.id_usuario, 
            email: userData.email,
            is_admin: userData.is_admin 
        };
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // Token expira em 1 dia

        // 4. BUSCAR OS PERFIS ASSOCIADOS A ESSE USUÁRIO.
        const queryProfiles = 'SELECT id_perfil, nome, avatar_url FROM Perfis WHERE id_usuario = ?';
        const perfis = dbAllAsync(queryProfiles, [userData.id_usuario]);

        // 5. RETORNAR RESPOSTA DE SUCESSO com os dados do usuário e seus perfis.
        return res.status(200).json({
            mensagem: "Login bem-sucedido!",
            accessToken: accessToken,
            usuario: {
                id_usuario: userData.id_usuario,
                email: userData.email,
                is_admin: userData.is_admin || false,
                perfis: perfis // Array com os perfis para o front-end
            }
        });

    } catch (error) {
        console.error('Erro no login:', error.message);
        return res.status(500).json({ mensagem: 'Erro interno no servidor ao tentar fazer login.' });
    }
});

module.exports = router;
