import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../Hooks/useDatabase';
import Spinner from '../Components/Spinner';
import '../main.css'
const Cadastro = () => {
  const { isReady, query, insert } = useDatabase();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isReady) {
      const availablePlans = query('SELECT * FROM Planos;');
      setPlans(availablePlans);
      if (availablePlans.length > 0) {
        setSelectedPlan(availablePlans[0].id_plano);
      }
    }
  }, [isReady, query]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !selectedPlan) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    try {
      // Simulação de hash de senha. Use bcrypt em um projeto real.
      const hashedPassword = password;
      
      insert('Usuarios', { 
        email: email, 
        senha_hash: hashedPassword, 
        id_plano: selectedPlan,
        status: 'ativo',
        is_admin: false, // Novos usuários nunca são adms
        data_criado: new Date().toISOString()
      });
      
      // Auto-login após registro
      const newUser = query('SELECT id_usuario, is_admin FROM Usuarios WHERE email = ?', [email]);
      if(newUser.length > 0) {
          localStorage.setItem('userId', newUser[0].id_usuario);
          localStorage.setItem('isAdmin', newUser[0].is_admin);
          alert('Cadastro realizado com sucesso!');
          navigate('/profiles');
      }
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        setError('Este email já está em uso.');
      } else {
        setError('Ocorreu um erro ao realizar o cadastro.');
      }
      console.error(err);
    }
  };

  if (!isReady) return <Spinner />;

  return (
    <div style={{ color: 'white', maxWidth: '450px', margin: 'auto', paddingTop: '80px' }}>
      <h1>Crie sua conta</h1>
      <form onSubmit={handleRegister}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        
        <h3>Selecione um Plano</h3>
        <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
          {plans.map(plan => (
            <option key={plan.id_plano} value={plan.id_plano}>
              {plan.nome} - R$ {plan.preco} ({plan.qualidade_max})
            </option>
          ))}
        </select>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '1.2em' }}>Cadastrar</button>
      </form>
    </div>
  );
};

export default Cadastro;