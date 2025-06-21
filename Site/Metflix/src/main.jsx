import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Design/main.css'
import ErrorPage from './Pages/Errorpage.jsx'
import Landing from './Pages/Landing.jsx'
import Login from './Pages/Login.jsx'
import Cadastro from './Pages/Cadastro.jsx'
import SelecionarPerfil from './Pages/SelectProfile.jsx'
import Home from './Pages/Home.jsx'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AdminRoute from './Components/Admin/AdminRoute.jsx'
import AdminPanel from './Pages/Admin/AdminPanel.jsx'
import MinhaLista from './Pages/MinhaLista.jsx'
import Historico from './Pages/Historico.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    errorElement: <ErrorPage />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path:'/cadastro',
    element: <Cadastro/>
  },
  {
    path: '/selecionar-perfil',
    element: <SelecionarPerfil/>
  },
  {
    path: '/home',
    element: <Home/>
  },
  {
    path: '/minha-lista',
    element: <MinhaLista />
  },
  {
    path: '/historico',
    element: <Historico />
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        path: 'panel', 
        element: <AdminPanel />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
