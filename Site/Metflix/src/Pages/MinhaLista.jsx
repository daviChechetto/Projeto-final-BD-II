// src/Pages/MinhaLista.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import ContentCard from '../Components/ContentCard';
import '../Design/PageGrid.css'; // Um CSS genérico para páginas de grid

const MinhaLista = () => {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const perfilAtivo = JSON.parse(sessionStorage.getItem('perfilAtivo'));
    const token = sessionStorage.getItem('accessToken');
    const API_URL = 'http://localhost:4000/api';

    useEffect(() => {
        if (perfilAtivo) {
            const fetchLista = async () => {
                const response = await fetch(`${API_URL}/perfis/${perfilAtivo.id_perfil}/minha-lista`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setLista(data);
                setLoading(false);
            };
            fetchLista();
        }
    }, [perfilAtivo, token]);

    return (
        <div className="page-container">
            <Navbar perfil={perfilAtivo} />
            <main className="page-content">
                <h1>Minha Lista</h1>
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <div className="content-grid">
                        {lista.length > 0 ? (
                            lista.map(item => (
                                <ContentCard key={item.id_conteudo} content={item} />
                            ))
                        ) : (
                            <p>Sua lista está vazia. Adicione filmes e séries para vê-los aqui.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MinhaLista;