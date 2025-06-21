function adminOnly(req, res, next) {
    // Este middleware deve rodar DEPOIS do authenticateToken,
    // então o objeto 'req.user' já deve existir.

    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ 
            mensagem: 'Acesso negado. Esta funcionalidade é restrita a administradores.' 
        });
    }

    // Se o usuário é admin, continua para a próxima função (o controller da rota)
    next();
}

module.exports = adminOnly;