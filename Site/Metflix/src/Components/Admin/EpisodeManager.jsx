import React, { useState, useEffect } from 'react';
import '../../Design/EpisodeManager.css'; // CSS para o modal

const EpisodeManager = ({ contentId, onClose, token }) => {
    const [episodios, setEpisodios] = useState([]);
    const [formState, setFormState] = useState({
        id_episodio: null,
        titulo: '',
        numero_temporada: 1,
        numero_episodio: 1,
        duracao_min: '',
        video_url: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const API_URL = 'http://localhost:4000';

    useEffect(() => {
        fetchEpisodios();
    }, [contentId]);

    const fetchEpisodios = async () => {
        const res = await fetch(`${API_URL}/conteudos/${contentId}/episodios`);
        const data = await res.json();
        setEpisodios(data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setFormState({
            id_episodio: null,
            titulo: '',
            numero_temporada: 1,
            numero_episodio: 1,
            duracao_min: '',
            video_url: ''
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/episodios/${formState.id_episodio}` : `${API_URL}/episodios`;
        const body = isEditing ? formState : { ...formState, id_conteudo: contentId };
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });

        resetForm();
        fetchEpisodios();
    };
    
    const handleEdit = (ep) => {
        setIsEditing(true);
        setFormState(ep);
    }
    
    const handleDelete = async (id) => {
        await fetch(`${API_URL}/episodios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchEpisodios();
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Gerenciar Episódios</h2>

                {/* Formulário de Episódio */}
                <form onSubmit={handleSubmit} className="episode-form">
                    <input name="titulo" value={formState.titulo} onChange={handleInputChange} placeholder="Título do Episódio" />
                    <input name="numero_temporada" type="number" value={formState.numero_temporada} onChange={handleInputChange} placeholder="Temporada" />
                    <input name="numero_episodio" type="number" value={formState.numero_episodio} onChange={handleInputChange} placeholder="Episódio" />
                    <button type="submit">{isEditing ? 'Salvar' : 'Adicionar'}</button>
                    {isEditing && <button type="button" onClick={resetForm}>Cancelar</button>}
                </form>

                {/* Lista de Episódios */}
                <div className="episode-list">
                    {episodios.map(ep => (
                        <div key={ep.id_episodio} className="episode-item">
                            <span>T{ep.numero_temporada}:E{ep.numero_episodio} - {ep.titulo}</span>
                            <div>
                                <button onClick={() => handleEdit(ep)}>Editar</button>
                                <button onClick={() => handleDelete(ep.id_episodio)}>Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EpisodeManager;