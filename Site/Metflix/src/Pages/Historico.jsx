// src/Pages/Historico.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import '../Design/PageGrid.css';

const HistoricoItem = ({ item }) => (
    <div className="list-item">
        <img src={item.thumbnail_url} alt={item.titulo_conteudo} />
        <div className="item-details">
            <h3>{item.titulo_conteudo}</h3>
            {item.tipo_conteudo === 'serie' && (
                <h4>T{item.numero_temporada}:E{item.numero_episodio} - {item.titulo_episodio}</h4>
            )}
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${item.progresso_percentual}%` }}></div>
            </div>
            <span>{item.progresso_percentual}% assistido</span>
        </div>
    </div>
);

const Historico = () => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const perfilAtivo = JSON.parse(sessionStorage.getItem('perfilAtivo'));
    const token = sessionStorage.getItem('accessToken');
    const API_URL = 'http://localhost:4000/api';

    useEffect(() => {
        if (perfilAtivo) {
            const fetchHistorico = async () => {
                const response = await fetch(`${API_URL}/perfis/${perfilAtivo.id_perfil}/historico`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setHistorico(data);
                setLoading(false);
            };
            fetchHistorico();
        }
    }, [perfilAtivo, token]);

    return (
        <div className="page-container">
            <Navbar perfil={perfilAtivo} />
            <main className="page-content">
                <h1>Histórico de Conteúdos Assistidos</h1>
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <div className="list-view">
                        {historico.length > 0 ? (
                            historico.map(item => (
                                <HistoricoItem key={item.id_historico} item={item} />
                            ))
                        ) : (
                            <p>Você ainda não assistiu nada.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Historico;