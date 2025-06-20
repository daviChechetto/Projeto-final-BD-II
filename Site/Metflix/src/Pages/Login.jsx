import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Você já está usando axios, então vamos mantê-lo

const Login = () => {
    const navigate = useNavigate();

    // Estados para o formulário e para controle de UI
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !senha) {
            setError('Email e senha são obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            // 1. Faz a chamada para a API de login
            const response = await axios.post('http://localhost:4000/login', { email, senha });

            // A API de login que fizemos retorna um objeto { mensagem, usuario }
            const { usuario } = response.data;

            if (usuario && usuario.id_usuario) {
                // 2. Salva o objeto do usuário inteiro no sessionStorage
                // O JSON.stringify é crucial para salvar o objeto corretamente
                sessionStorage.setItem('usuario', JSON.stringify(usuario));

                // 3. Usa o navigate para redirecionar para a seleção de perfil
                navigate('/selecionar-perfil');
            } else {
                // Caso a resposta não venha como esperado
                throw new Error('Dados de login inválidos recebidos do servidor.');
            }

        } catch (err) {
            // Pega a mensagem de erro da resposta da API ou uma mensagem padrão
            const errorMessage = err.response?.data?.mensagem || err.message || 'Falha no login. Verifique suas credenciais.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="form-container">
                <h1>Entrar</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        className="form-input"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Senha"
                        required
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="form-button" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>
                        Novo por aqui? <Link to="/cadastro">Assine agora.</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
