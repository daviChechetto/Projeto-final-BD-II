import { Outlet } from "react-router-dom";
import './main.css'


export default function App(){
    return(
        <>
        <header style={{display: 'flex', alignItems: 'center', padding: '1rem 4%'}}>
            <h1 style={{color: 'var(--primary-purple)', marginRight: 'auto'}}>STREAMCO</h1>
            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="form-button" style={{width: 'auto', padding: '8px 16px', margin: 0}}>Sair</button>
        </header>
        <main><Outlet /></main>
        </>
    )
}