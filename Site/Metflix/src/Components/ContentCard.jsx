// src/Components/ContentCard.jsx
import React from 'react';

// Agora o card recebe as funções de clique como props
const ContentCard = ({ content, onAddToMyList, onPlay }) => {
    return (
        <div className="card">
            <img
                style={{objectFit:"cover"}}
                src={content.thumbnail_url || 'https://placehold.co/180x270/1C1C21/A9A9A9?text=Sem+Imagem'}
                alt={content.titulo}
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/180x270/1C1C21/A9A9A9?text=Erro' }}
            />
            <div className="card-overlay">
                <h4>{content.titulo}</h4>
                <div className="card-actions">
                    <button onClick={() => onAddToMyList(content.id_conteudo)} title="Adicionar ou remover da Minha Lista">
                        +
                    </button>
                    <button onClick={() => onPlay(content.id_conteudo)} title="Assistir">
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentCard;