import React from 'react';
import ContentCard from './ContentCard'; // Importando o componente do card

const ContentRow = ({ title, contents, onAddToMyList, onPlay }) => (
    <div className="content-row">
        <h2>{title}</h2>
        <div className="row-container">
            {contents.map(content => (
                <ContentCard 
                    key={content.id_conteudo} 
                    content={content}
                    onAddToMyList={onAddToMyList}
                    onPlay={onPlay}
                />
            ))}
        </div>
    </div>
);

export default ContentRow;