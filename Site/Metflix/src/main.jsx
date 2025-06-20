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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    errorElement: <ErrorPage />
  },
  {
    path: '/Login',
    element: <Login />
  },
  {
    path:'/Cadastro',
    element: <Cadastro/>
  },
  {
    path: '/Selecionar-Perfil',
    element: <SelecionarPerfil/>
  },
  {
    path: '/Home',
    element: <Home/>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
