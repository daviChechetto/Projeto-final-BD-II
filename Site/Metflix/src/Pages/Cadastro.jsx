import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import '../Design/main.css'

const Cadastro = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nomePerfil, setNomePerfil] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');

    // Estados para controle da UI
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Efeito para buscar os planos da API quando o componente é montado
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('http://localhost:4000/planos');
                if (!response.ok) {
                    throw new Error('Não foi possível carregar os planos.');
                }
                const data = await response.json();
                setPlans(data);
                // Define o primeiro plano da lista como padrão
                if (data.length > 0) {
                    setSelectedPlan(data[0].id_plano);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // Função para lidar com o envio do formulário
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !senha || !selectedPlan || !nomePerfil) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha,
                    id_plano: selectedPlan,
                    nome_perfil: nomePerfil,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Se a resposta não for OK, lança um erro com a mensagem da API
                throw new Error(data.mensagem || 'Ocorreu um erro no cadastro.');
            }

            // Sucesso! Exibe a mensagem e redireciona após um tempo
            setSuccess(data.mensagem);
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redireciona para o login após 2 segundos

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="form-container">
                <h1>Crie sua conta</h1>
                <form onSubmit={handleRegister}>
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
                        placeholder="Senha (mínimo 6 caracteres)"
                        required
                    />
                    <input
                        type="text"
                        className="form-input"
                        value={nomePerfil}
                        onChange={(e) => setNomePerfil(e.target.value)}
                        placeholder="Nome do seu primeiro perfil"
                        required
                    />
                    
                    <label htmlFor="plan-select" style={{ marginBottom: '8px', color: 'var(--text-secondary)'}}>Selecione um Plano:</label>
                    <select
                        id="plan-select"
                        className="form-select"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                    >
                        {plans.map(plan => (
                            <option key={plan.id_plano} value={plan.id_plano}>
                                {plan.nome} - R$ {plan.preco} ({plan.qualidade_max})
                            </option>
                        ))}
                    </select>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p style={{ color: 'lightgreen', marginBottom: '10px' }}>{success}</p>}

                    <button type="submit" className="form-button">Cadastrar</button>

                    <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>
                        Já tem uma conta? <Link to="/login">Faça login agora.</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Cadastro;