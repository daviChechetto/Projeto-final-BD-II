import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../Hooks/useDatabase'; // Supondo que você tem esse hook

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { query } = useDatabase(); // Simulação, a validação de senha seria no backend
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      // ATENÇÃO: A verificação de senha deve ser feita no backend com bcrypt.
      // Aqui, faremos uma busca simples apenas para o propósito do projeto da faculdade.
      const users = query('SELECT id_usuario, senha_hash FROM Usuarios WHERE email = ?', [email]);
      
      if (users.length > 0) {
        // Em um app real: if (bcrypt.compareSync(password, users[0].senha_hash))
        if (password === users[0].senha_hash) { // Simulação
            alert('Login bem-sucedido!');
            const userData = query('SELECT id_usuario, is_admin FROM Usuarios WHERE email = ?', [email]);
            localStorage.setItem('userId', userData[0].id_usuario);
            localStorage.setItem('isAdmin', userData[0].is_admin); // Salva o status de admin
           navigate('/profiles');
        } else {
          setError('Email ou senha inválidos.');
        }
      } else {
        setError('Email ou senha inválidos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
      console.error(err);
    }
  };

  return (
    <div style={{ color: 'white', maxWidth: '400px', margin: 'auto', paddingTop: '100px' }}>
      <h1>Entrar</h1>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Entrar</button>
      </form>
    </div>
  );
};

export default Login;