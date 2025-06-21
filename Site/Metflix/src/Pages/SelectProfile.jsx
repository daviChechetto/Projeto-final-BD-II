import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelecionarPerfil = () => {
    const navigate = useNavigate();
    const [perfis, setPerfis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            // 1. Pega os dados do usuário do sessionStorage
            const dadosUsuarioString = sessionStorage.getItem('usuario');
            if (!dadosUsuarioString) {
                navigate('/login');
                return;
            }
            
            const usuarioLogado = JSON.parse(dadosUsuarioString);

            // 2. Verifica se os perfis existem no objeto do usuário
            // Em vez de fazer uma nova chamada fetch, usamos os perfis que já vieram da rota de login
            if (usuarioLogado && usuarioLogado.perfis && usuarioLogado.perfis.length > 0) {
                setPerfis(usuarioLogado.perfis);
            } else {
                // Se por algum motivo não houver perfis, mostramos um erro ou buscamos novamente (opcional)
                setError('Nenhum perfil encontrado para este usuário.');
            }
        } catch (err) {
            console.error("Erro ao processar dados do usuário:", err);
            setError("Ocorreu um erro ao carregar seus perfis. Por favor, faça login novamente.");
            // Limpa a sessão corrompida e redireciona
            sessionStorage.clear();
            navigate('/login');
        } finally {
            setLoading(false);
        }

    }, [navigate]);

    // Função para selecionar o perfil (continua igual)
    const handleProfileSelect = (perfil) => {
        sessionStorage.setItem('perfilAtivo', JSON.stringify(perfil));
        navigate('/home');
    };

    if (loading) {
        // Pode usar um componente de spinner mais elaborado aqui
        return <div>Carregando perfis...</div>; 
    }

    return (
        <div className="profile-select-container">
            <h1>Quem está assistindo?</h1>
            
            {error && <p className="error-message">{error}</p>}

            <div className="profiles-grid">
                {perfis.map((perfil) => (
                    <div key={perfil.id_perfil} className="profile-card" onClick={() => handleProfileSelect(perfil)}>
                        <img
                            src={perfil.avatar_url || `https://placehold.co/180x180/1C1C21/A9A9A9?text=${perfil.nome.charAt(0)}`}
                            alt={`Avatar de ${perfil.nome}`}
                        />
                        <h2>{perfil.nome}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelecionarPerfil;