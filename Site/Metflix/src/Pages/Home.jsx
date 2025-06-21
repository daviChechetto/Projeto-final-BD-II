import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importando os novos componentes e o CSS
import Navbar from '../Components/Navbar';
import ContentRow from '../Components/ContentRow';
import '../Design/Home.css';

const Home = () => {
    const navigate = useNavigate();

    const [perfilAtivo, setPerfilAtivo] = useState(null);
    const [heroContent, setHeroContent] = useState(null);
    const [contentRows, setContentRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '' });

    const token = sessionStorage.getItem('accessToken');
    const API_URL = 'http://localhost:4000/api';

    useEffect(() => {
        const perfilData = sessionStorage.getItem('perfilAtivo');
        if (!perfilData) {
            navigate('/selecionar-perfil');
            return;
        }
        setPerfilAtivo(JSON.parse(perfilData));

        const fetchBrowseData = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/browse');
                if (!response.ok) {
                    throw new Error(`Erro na rede: ${response.status}`);
                }
                const data = await response.json();
                setHeroContent(data.heroContent);
                setContentRows(data.rows);
            } catch (err) {
                console.error("Falha ao buscar dados do browse:", err);
                setError('Não foi possível carregar o conteúdo. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchBrowseData();
    }, [navigate]);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleAddToMyList = async (id_conteudo) => {
        if (!perfilAtivo) return;
        try {
            const response = await fetch(`${API_URL}/perfis/${perfilAtivo.id_perfil}/minha-lista`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_conteudo })
            });
            const data = await response.json();
            showToast(data.mensagem); // Mostra o feedback da API
        } catch (err) {
            showToast('Erro ao adicionar à lista.');
        }
    };

    const handlePlay = async (id_conteudo) => {
        if (!perfilAtivo) return;
        try {
            await fetch(`${API_URL}/perfis/${perfilAtivo.id_perfil}/historico`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_conteudo })
            });
            showToast('Adicionado ao seu histórico!');
            // Aqui você poderia navegar para uma página de player de vídeo
            // navigate(`/watch/${id_conteudo}`);
        } catch (err) {
            showToast('Erro ao registrar no histórico.');
        }
    };

    if (loading) {
        return <div className="spinner">Carregando...</div>;
    }

    if (error) {
        return <p className="error-message centered-message">{error}</p>;
    }

    return (
        <div className="browse-page">
            <Navbar perfil={perfilAtivo} />

            {heroContent && (
                <header
                    className="hero-section"
                    style={{ backgroundImage: `url(${heroContent.thumbnail_url || ''})` }}
                >
                    <div className="hero-content">
                        <h1>{heroContent.titulo}</h1>
                        <p>{heroContent.descricao}</p>
                        <div className="hero-buttons">
                            <button className="hero-button play-button">▶ Assistir</button>
                            <button className="hero-button info-button">ⓘ Mais informações</button>
                        </div>
                    </div>
                </header>
            )}

            <main>
                {contentRows.map(row => (
                    <ContentRow
                        key={row.title}
                        title={row.title}
                        contents={row.contents} 
                        onAddToMyList={handleAddToMyList}
                        onPlay={handlePlay}
                    />
                ))}
            </main>
        </div>
    );
};

export default Home;