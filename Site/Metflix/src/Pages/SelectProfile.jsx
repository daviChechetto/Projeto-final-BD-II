import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componente para a tela de seleção de perfis.
const SelecionarPerfil = () => {
    const navigate = useNavigate();

    // Estados para controle da UI
    const [perfis, setPerfis] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Pega os dados do usuário do sessionStorage (que foram salvos no login)
        const dadosUsuario = sessionStorage.getItem('usuario');
        if (!dadosUsuario) {
            navigate('/login');
            return;
        }
        
        const usuarioLogado = JSON.parse(dadosUsuario);
        setUsuario(usuarioLogado);

        // 2. Função para buscar os perfis da API
        const fetchPerfis = async () => {
            if (!usuarioLogado?.id_usuario) return;

            try {
                const response = await fetch(`http://localhost:4000/usuarios/${usuarioLogado.id_usuario}/perfis`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.mensagem || 'Não foi possível carregar os perfis.');
                }

                const data = await response.json();
                setPerfis(data);

            } catch (err) {
                console.error("Falha ao buscar perfis:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfis();

    }, [navigate]);

    // Função chamada quando um perfil é selecionado.
    const handleProfileSelect = (perfil) => {
        // Salva o perfil selecionado no sessionStorage para que outras partes do app saibam quem está assistindo.
        sessionStorage.setItem('perfilAtivo', JSON.stringify(perfil));
        // Navega para a página principal.
        navigate('/home'); // Ajuste a rota para '/home' ou '/browse' conforme seu roteador
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div className="profile-select-container">
            <h1>Quem está assistindo?</h1>
            
            {error && <p className="error-message">{error}</p>}

            <div className="profiles-grid">
                {perfis.map((perfil) => (
                    <div key={perfil.id_perfil} className="profile-card" onClick={() => handleProfileSelect(perfil)}>
                        <img
                            src={perfil.avatar_url || 'https://placehold.co/180x180/1C1C21/A9A9A9?text=?'}
                            alt={`Avatar de ${perfil.nome}`}
                        />
                        <h2>{perfil.nome}</h2>
                    </div>
                ))}
                {/* Futuramente, você pode adicionar um card para criar um novo perfil aqui */}
            </div>
            {/* <button className="manage-profiles-button">Gerenciar Perfis</button> */}
        </div>
    );
};

export default SelecionarPerfil;
