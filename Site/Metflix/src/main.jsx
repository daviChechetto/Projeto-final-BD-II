import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './main.css';

// Páginas e Componentes
import Landing from './Pages/Landing';
import Cadastro from './Pages/Cadastro';
import Login from './Pages/Login';
import ErrorPage from './Pages/ErrorPage';
import Home from './Pages/Home';
import ProfileSelect from './Pages/ProfileSelect';
import PlayerPage from './Pages/PlayerPage';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
    // Verifica se existe um 'userId' no localStorage. Se não, redireciona para /login.
    return !!localStorage.getItem('userId') ? children : <Navigate to="/login" replace />;
};

// Componente de Layout para páginas internas (Home, Player, etc.)
// Ele garante que o usuário esteja logado e renderiza o conteúdo da rota filha
const AppLayout = () => {
    return (
        <PrivateRoute>
            {/* O Outlet renderiza o componente da rota filha (Home, PlayerPage, etc.) */}
            <main>
                <Outlet />
            </main>
        </PrivateRoute>
    );
};


const router = createBrowserRouter([
    { path: '/', element: <Landing />, errorElement: <ErrorPage /> },
    { path: '/cadastro', element: <Cadastro /> },
    { path: '/login', element: <Login /> },
    { 
      path: '/profiles', 
      element: (
        <PrivateRoute>
          <ProfileSelect />
        </PrivateRoute>
      ) 
    },
    {
        // Esta é a rota "pai" que usa o AppLayout
        element: <AppLayout />,
        errorElement: <ErrorPage />,
        // As rotas filhas serão renderizadas dentro do <Outlet /> do AppLayout
        children: [
            { path: '/home', element: <Home /> },
            { path: '/player/:contentId', element: <PlayerPage /> },
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastContainer />
        <RouterProvider router={router} />
    </StrictMode>
);