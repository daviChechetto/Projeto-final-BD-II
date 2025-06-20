import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const Navbar = ({ perfil }) => (
    <nav style={styles.navbar}>
        <div style={styles.navLeft}>
            <Link to="/browse" style={styles.logo}>CLONEFLIX</Link>
            <Link to="/browse" style={styles.navLink}>Início</Link>
            <Link to="#" style={styles.navLink}>Séries</Link>
            <Link to="#" style={styles.navLink}>Filmes</Link>
        </div>
        <div style={styles.navRight}>
            {perfil && (
                 <img
                    src={perfil.avatar_url || 'https://placehold.co/40x40/1C1C21/A9A9A9?text=?'}
                    alt={`Avatar de ${perfil.nome}`}
                    style={styles.profileIcon}
                />
            )}
        </div>
    </nav>
);

/**
 * ContentCard: Um único card de filme ou série.
 */
const ContentCard = ({ content }) => (
    <div className="card">
        <img
            src={content.thumbnail_url || 'https://placehold.co/180x270/1C1C21/A9A9A9?text=Sem+Imagem'}
            alt={content.titulo}
            // Fallback para caso a imagem falhe
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/180x270/1C1C21/A9A9A9?text=Erro' }}
        />
        <h4>{content.titulo}</h4>
    </div>
);

/**
 * ContentRow: Uma fileira de conteúdos (ex: "Em Alta").
 */
const ContentRow = ({ title, contents }) => (
    <div className="content-row">
        <h2>{title}</h2>
        <div className="row-container">
            {contents.map(content => (
                <ContentCard key={content.id_conteudo} content={content} />
            ))}
        </div>
    </div>
);


/**
 * Componente Principal: A página Home/Browse.
 */
const Home = () => {
    const navigate = useNavigate();

    // Estados para os dados, carregamento e erros
    const [perfilAtivo, setPerfilAtivo] = useState(null);
    const [heroContent, setHeroContent] = useState(null);
    const [contentRows, setContentRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Verifica se existe um perfil ativo na sessão
        const perfilData = sessionStorage.getItem('perfilAtivo');
        if (!perfilData) {
            navigate('/selecionar-perfil'); // Se não houver, redireciona
            return;
        }
        setPerfilAtivo(JSON.parse(perfilData));

        // 2. Função para buscar os dados do backend
        const fetchBrowseData = async () => {
            try {
                const response = await fetch('http://localhost:4000/browse-data');
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
                setLoading(false); // Termina o carregamento, com sucesso ou erro
            }
        };

        fetchBrowseData();
    }, [navigate]);

    // 3. Renderiza a tela de carregamento
    if (loading) {
        return <div className="spinner"></div>;
    }

    // 4. Renderiza a tela de erro
    if (error) {
        return <p className="error-message" style={{...styles.centeredMessage, color: 'var(--danger-red)'}}>{error}</p>;
    }

    // 5. Renderiza a página principal com os dados
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
                        <div style={styles.heroButtons}>
                            <button style={{...styles.button, ...styles.playButton}}>▶ Assistir</button>
                            <button style={{...styles.button, ...styles.infoButton}}>ⓘ Mais informações</button>
                        </div>
                    </div>
                </header>
            )}

            <main style={{paddingTop: '20px'}}>
                {contentRows.map(row => (
                    <ContentRow
                        key={row.genero}
                        title={row.genero}
                        contents={row.conteudos}
                    />
                ))}
            </main>
        </div>
    );
};

// Estilos para os componentes que não estão no seu CSS
const styles = {
    navbar: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 4%',
        backgroundColor: 'rgba(16, 16, 20, 0.8)',
        backdropFilter: 'blur(5px)',
        zIndex: 100,
        transition: 'background-color 0.3s',
    },
    navLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    logo: {
        color: 'var(--primary-purple)',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    navLink: {
        color: 'var(--text-primary)',
        fontSize: '1rem',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
    },
    profileIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    centeredMessage: {
        textAlign: 'center',
        marginTop: '20vh',
        fontSize: '1.2rem',
    },
    heroButtons: {
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
    },
    button: {
        padding: '10px 25px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    playButton: {
        backgroundColor: 'var(--text-primary)',
        color: 'var(--background-primary)',
    },
    infoButton: {
        backgroundColor: 'rgba(109, 109, 110, 0.7)',
        color: 'var(--text-primary)',
    }
};

export default Home;
