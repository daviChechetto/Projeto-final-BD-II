import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    // Pega os dados do usuário salvos no sessionStorage durante o login
    const usuarioString = sessionStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    // Verifica se o usuário existe e se tem a flag is_admin
    const isAdmin = usuario && usuario.is_admin;

    // Se for admin, renderiza o componente filho (no nosso caso, o AdminPanel)
    // Se não for, redireciona para a página home
    return isAdmin ? <Outlet /> : <Navigate to="/home" replace />;
};

export default AdminRoute;