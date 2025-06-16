import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../Hooks/useDatabase';
import Spinner from '../Components/Spinner';
import '../main.css'

const ProfileSelect = () => {
  const { isReady, query, insert } = useDatabase();
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (isReady && userId) {
      const userProfiles = query('SELECT * FROM Perfis WHERE id_usuario = ?', [userId]);
      setProfiles(userProfiles);
    }
  }, [isReady, userId, query]);

  const handleSelectProfile = (profileId) => {
    localStorage.setItem('profileId', profileId);
    navigate('/browse');
  };

  const handleAddProfile = () => {
    const newProfileName = prompt("Digite o nome do novo perfil:");
    if (newProfileName) {
      try {
        insert('Perfis', { nome: newProfileName, id_usuario: userId, avatar_url: 'default_avatar.png' });
        // Recarrega os perfis
        const userProfiles = query('SELECT * FROM Perfis WHERE id_usuario = ?', [userId]);
        setProfiles(userProfiles);
      } catch (err) {
        alert("Erro ao criar perfil.");
        console.error(err);
      }
    }
  };

  if (!isReady) return <Spinner />;

  return (
    <div style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>
      <h1>Quem está assistindo?</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
        {profiles.map(profile => (
          <div key={profile.id_perfil} onClick={() => handleSelectProfile(profile.id_perfil)} style={{ cursor: 'pointer' }}>
            {/* Usar a coluna avatar_url aqui no futuro */}
            <img src={`https://via.placeholder.com/150?text=${profile.nome.charAt(0)}`} alt={profile.nome} style={{ borderRadius: '4px' }}/>
            <h2>{profile.nome}</h2>
          </div>
        ))}
        {profiles.length < 4 && ( // Limita a 4 perfis, por exemplo
          <div onClick={handleAddProfile} style={{ cursor: 'pointer' }}>
            <img src="https://via.placeholder.com/150?text=+" alt="Adicionar Perfil" style={{ borderRadius: '4px' }}/>
            <h2>Adicionar Perfil</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelect;