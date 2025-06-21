import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ perfil }) => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Pega os dados do usuário para verificar se é admin
        const usuarioString = sessionStorage.getItem('usuario');
        if (usuarioString) {
            const usuario = JSON.parse(usuarioString);
            setIsAdmin(usuario.is_admin);
        }
    }, []);

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/home" className="logo">CLONEFLIX</Link>
                <Link to="/home" className="nav-link">Início</Link>
                <Link to="#" className="nav-link">Minha Lista</Link>
                <Link to="#" className="nav-link">Séries</Link>
                <Link to="#" className="nav-link">Filmes</Link>

                {isAdmin && (
                    <Link to="/admin/panel" className="nav-link" style={{ color: 'var(--cor-destaque)' }}>
                        Painel Admin
                    </Link>
                )}
            </div>
            
            <div className="nav-right">
                <Link style={{marginRight:"10px"}} to="/login">Sair</Link>
                {perfil && (
                    <img
                        src={perfil.avatar_url || `https://placehold.co/40x40/EBF4FF/76A9EA?text=${perfil.nome.charAt(0)}`}
                        alt={`Avatar de ${perfil.nome}`}
                        className="profile-icon"
                    />
                )}
            </div>
        </nav>
    );
};

export default Navbar;