import React from 'react';
import ContentCard from './ContentCard';

const ContentRow = ({ title, contentList, onCardClick }) => {
  if (!contentList || contentList.length === 0) {
    return null; // Não renderiza a fileira se não houver conteúdo
  }

  return (
    <div className="content-row" style={{ marginBottom: '30px' }}>
      <h2 style={{ color: '#fff' }}>{title}</h2>
      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '15px' }}>
        {contentList.map(content => (
          <ContentCard 
            key={content.id_conteudo} 
            content={content} 
            onClick={onCardClick}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />        
        ))}
      </div>
    </div>
  );
};

export default ContentRow;