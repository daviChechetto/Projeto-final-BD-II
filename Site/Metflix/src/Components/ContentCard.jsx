import React from 'react';
import AdminControls from './AdminControls';

const ContentCard = ({ content, onClick, isAdmin, onEdit, onDelete }) => {
  return (
    <div 
      className="card" 
      style={{ cursor: 'pointer', minWidth: '180px', margin: '0 5px', position: 'relative' }}
    >
      <img 
        src={content.thumbnail_url} 
        alt={content.titulo} 
        style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
        onClick={() => onClick(content.id_conteudo)} 
      />
      {isAdmin && (
        <AdminControls
          onEdit={(e) => { e.stopPropagation(); onEdit(content); }}
          onDelete={(e) => { e.stopPropagation(); onDelete(content.id_conteudo); }}
        />
      )}
      <h4 onClick={() => onClick(content.id_conteudo)} style={{ marginTop: '5px', color: '#fff' }}>{content.titulo}</h4>
    </div>
  );
};

export default ContentCard;