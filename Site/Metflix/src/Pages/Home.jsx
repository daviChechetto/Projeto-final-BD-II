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
                    />
                ))}
            </main>
        </div>
    );
};

export default Home;