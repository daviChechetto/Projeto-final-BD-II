import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../Hooks/useDatabase';
import Spinner from '../Components/Spinner';
import '../main.css'

const PlayerPage = () => {
  const { contentId } = useParams();
  const { isReady, query, upsertHistory } = useDatabase();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  
  const profileId = localStorage.getItem('profileId');
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    if (isReady) {
      const result = query('SELECT * FROM Conteudos WHERE id_conteudo = ?', [contentId]);
      if (result.length > 0) {
        setContent(result[0]);
      } else {
        setError('Conteúdo não encontrado.');
      }
    }
  }, [isReady, contentId, query]);

  const handleTimeUpdate = () => {
    const currentTime = Date.now();
    // Atualiza o histórico a cada 15 segundos
    if (currentTime - lastUpdateTime.current > 15000) {
      const progressSeconds = videoRef.current.currentTime;
      upsertHistory(profileId, contentId, null, progressSeconds); // null para id_episodio em filmes
      lastUpdateTime.current = currentTime;
      console.log(`Progresso salvo: ${progressSeconds}s`);
    }
  };

  if (error) return <div style={{ color: 'red', textAlign: 'center', paddingTop: '50px' }}><h1>{error}</h1></div>;
  if (!content) return <Spinner />;

  return (
    <div>
      <button onClick={() => navigate('/browse')} style={{ margin: '20px', padding: '10px' }}>&larr; Voltar</button>
      <video
        ref={videoRef}
        width="100%"
        controls
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTimeUpdate} // Garante que o progresso final seja salvo
        src={content.video_url} // Assumindo que o campo se chama video_url no seu DB
      >
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
};

export default PlayerPage;