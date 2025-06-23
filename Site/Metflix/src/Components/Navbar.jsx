// src/Components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ perfil }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const usuarioString = sessionStorage.getItem('usuario');
        if (usuarioString) {
            const usuario = JSON.parse(usuarioString);
            setIsAdmin(usuario.is_admin);
        }

        // Fecha o dropdown se clicar fora dele
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/home" className="logo">METFLIX</Link>
                <Link to="/home" className="nav-link">Início</Link>
                {isAdmin && (
                    <Link to="/admin/panel" className="nav-link admin-link">Painel Admin</Link>
                )}
                <Link to="/login" className="nav-link">Sair</Link>
            </div>
            <div className="nav-right" ref={dropdownRef}>
                {perfil && (
                    <img
                        src={perfil.avatar_url || `https://placehold.co/40x40/EBF4FF/76A9EA?text=${perfil.nome.charAt(0)}`}
                        alt={`Avatar de ${perfil.nome}`}
                        className="profile-icon"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    />
                )}
                {dropdownOpen && (
                    <div className="profile-dropdown">
                        <Link to="/minha-lista" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Minha Lista</Link>
                        <Link to="/historico" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Histórico</Link>
                        <div className="dropdown-divider"></div>
                        <a href="#" onClick={handleLogout} className="dropdown-item">Sair</a>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;