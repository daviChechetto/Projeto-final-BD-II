import React from 'react';

const ContentCard = ({ content }) => {
    return (
        <div className="card">
            <img
                src={content.thumbnail_url || 'https://placehold.co/180x270/1C1C21/A9A9A9?text=Sem+Imagem'}
                alt={content.titulo}
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/180x270/1C1C21/A9A9A9?text=Erro' }}
            />
            <h4>{content.titulo}</h4>
        </div>
    );
};

export default ContentCard;