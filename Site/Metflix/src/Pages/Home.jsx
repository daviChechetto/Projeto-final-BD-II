import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../Hooks/useDatabase';
import ContentRow from '../Components/ContentRow';
import Spinner from '../Components/Spinner';
import '../main.css'

const Home = () => {
  const { isReady, query } = useDatabase();
  const [content, setContent] = useState({ myList: [], continueWatching: [], action: [], comedy: [] });
  const [loading, setLoading] = useState(true);
  const profileId = localStorage.getItem('profileId');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleEdit = (content) => {
    // Lógica para abrir um modal ou navegar para uma página de edição
    alert(`Editar: ${content.titulo}`);
    // Ex: navigate(`/admin/edit/${content.id_conteudo}`);
  };

    const handleDelete = (contentId) => {
    if (window.confirm("Tem certeza que deseja excluir este conteúdo?")) {
      try {
        // Você precisaria deletar de `Conteudo_Genero`, `Historicos`, etc. antes.
        // Por simplicidade, vamos deletar apenas de `Conteudos`.
        // deleteRow('Conteudos', { id_conteudo: contentId });
        alert(`Conteúdo ${contentId} excluído! (Simulação)`);
        // Recarregar a lista de conteúdos
      } catch (err) {
        alert("Erro ao excluir.");
      }
    }
  };

  const handleAddContent = () => {
    alert("Abrir formulário para adicionar novo conteúdo.");
    // Ex: navigate('/admin/add');
  };

  useEffect(() => {
    if (isReady && profileId) {
      try {
        // Query para Minha Lista
        const myList = query(`
          SELECT c.* FROM Conteudos c
          JOIN Minha_Lista ml ON c.id_conteudo = ml.id_conteudo
          WHERE ml.id_perfil = ?`, [profileId]);
        
        // Query para Continuar Assistindo
        const continueWatching = query(`
          SELECT c.* FROM Conteudos c
          JOIN Historicos h ON c.id_conteudo = h.id_conteudo
          WHERE h.id_perfil = ? ORDER BY h.data_visualizacao DESC`, [profileId]);
        
        // Query para Gênero: Ação (id_genero = 1, por exemplo)
        const action = query(`
          SELECT c.* FROM Conteudos c
          JOIN Conteudo_Genero cg ON c.id_conteudo = cg.id_conteudo
          WHERE cg.id_genero = 1`, []); // Supondo que Ação é gênero 1

        // Query para Gênero: Comédia (id_genero = 2, por exemplo)
        const comedy = query(`
          SELECT c.* FROM Conteudos c
          JOIN Conteudo_Genero cg ON c.id_conteudo = cg.id_conteudo
          WHERE cg.id_genero = 2`, []); // Supondo que Comédia é gênero 2

        setContent({ myList, continueWatching, action, comedy });

      } catch (err) {
        console.error("Erro ao buscar conteúdo:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [isReady, profileId, query]);

  const handleCardClick = (contentId) => {
    // Navegar para uma página de detalhes ou direto para o player
    navigate(`/player/${contentId}`);
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '20px 60px' }}>
      {/* Aqui poderia entrar um componente de Header/Navbar */}
      
      <div style={{ height: '400px', background: '#333', marginBottom: '30px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Conteúdo em Destaque (Hero)</h1>
      </div>

      <ContentRow title="Continuar Assistindo" contentList={content.continueWatching} onCardClick={handleCardClick} />
      <ContentRow 
        title="Minha Lista" 
        contentList={content.myList} 
        onCardClick={handleCardClick}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
       <ContentRow 
        title="Ação" 
        contentList={content.action} 
        onCardClick={handleCardClick}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ContentRow title="Comédia" contentList={content.comedy} onCardClick={handleCardClick} />
    </div>
  );
};

export default Home;                                                                                                                                