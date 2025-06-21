import React, { useState, useEffect } from 'react';
import '../../Design/adminPanel.css';
import Navbar from '../../Components/Navbar'; 
const AdminPanel = () => {
    // Estados do componente
    const [conteudos, setConteudos] = useState([]);
    const [generos, setGeneros] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    
    // Estado do formulário principal
    const [formState, setFormState] = useState({
        titulo: '',
        descricao: '',
        ano_lancamento: '',
        duracao_min: '',
        tipo_conteudo: 'filme',
        thumbnail_url: ''
    });

    // NOVO: Estado para os episódios e gêneros
    const [episodios, setEpisodios] = useState([{ numero_temporada: 1, numero_episodio: 1, titulo: '', video_url: '' }]);
    const [selectedGenres, setSelectedGenres] = useState(new Set());

    // Configurações da API
    const API_URL = 'http://localhost:4000/api'; // Usando o prefixo /api
    const token = sessionStorage.getItem('accessToken');

    useEffect(() => {
        fetchConteudos();
        fetchGeneros();
    }, []);

const fetchConteudos = async () => {
        try {
            const response = await fetch(`${API_URL}/conteudos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar conteúdos.');
            const data = await response.json();
            setConteudos(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Função para buscar a lista de todos os gêneros disponíveis
    const fetchGeneros = async () => {
        try {
            const response = await fetch(`${API_URL}/generos`);
            if (!response.ok) throw new Error('Falha ao buscar gêneros.');
            const data = await response.json();
            setGeneros(data);
        } catch (err) {
            setError(err.message);
        }
    };
    // --- LÓGICA DO FORMULÁRIO PRINCIPAL ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        // Se mudar para filme, limpa os episódios
        if (name === 'tipo_conteudo' && value === 'filme') {
            setEpisodios([{ numero_temporada: 1, numero_episodio: 1, titulo: '', video_url: '' }]);
        }
    };

    const handleGenreChange = (genreId) => {
        const newSelectedGenres = new Set(selectedGenres);
        if (newSelectedGenres.has(genreId)) {
            newSelectedGenres.delete(genreId);
        } else {
            newSelectedGenres.add(genreId);
        }
        setSelectedGenres(newSelectedGenres);
    };
    // --- NOVAS FUNÇÕES PARA GERENCIAR EPISÓDIOS ---
    const handleEpisodeChange = (index, event) => {
        const newEpisodios = [...episodios];
        newEpisodios[index][event.target.name] = event.target.value;
        setEpisodios(newEpisodios);
    };

    const addEpisodeField = () => {
        const lastEp = episodios[episodios.length - 1];
        setEpisodios([...episodios, { 
            numero_temporada: lastEp.numero_temporada, 
            numero_episodio: parseInt(lastEp.numero_episodio, 10) + 1, 
            titulo: '', 
            video_url: '' 
        }]);
    };

    const removeEpisodeField = (index) => {
        const newEpisodios = episodios.filter((_, i) => i !== index);
        setEpisodios(newEpisodios);
    };

    // --- LÓGICA DE SUBMISSÃO E EDIÇÃO ---
    const resetForm = () => {
        setIsEditing(false);
        setFormState({ titulo: '', descricao: '', ano_lancamento: '', duracao_min: '', tipo_conteudo: 'filme', thumbnail_url: '' });
        setSelectedGenres(new Set());
        setEpisodios([{ numero_temporada: 1, numero_episodio: 1, titulo: '', video_url: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/conteudos/${formState.id_conteudo}` : `${API_URL}/conteudos`;
        
        const body = {
            ...formState,
            genero_ids: Array.from(selectedGenres),
            // Inclui os episódios no corpo da requisição se for uma série
            episodios: formState.tipo_conteudo === 'serie' ? episodios : []
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error((await response.json()).mensagem);
            
            resetForm();
            fetchConteudos();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = async (conteudo) => {
        try {
            const response = await fetch(`${API_URL}/conteudos/${conteudo.id_conteudo}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Não foi possível carregar os dados para edição.');
            
            const data = await response.json();
            
            setIsEditing(true);
            setFormState(data);
            setSelectedGenres(new Set(data.genero_ids));
            if(data.tipo_conteudo === 'serie' && data.episodios && data.episodios.length > 0) {
                setEpisodios(data.episodios);
            } else {
                setEpisodios([{ numero_temporada: 1, numero_episodio: 1, titulo: '', video_url: '' }]);
            }
        } catch (err) {
            setError(err.message)
        }
    };

    // Deleta um conteúdo
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este conteúdo? A ação não pode ser desfeita.')) {
            try {
                const response = await fetch(`${API_URL}/conteudos/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao excluir o conteúdo.');

                fetchConteudos(); // Recarrega a lista
            } catch (err) {
                setError(err.message);
            }
        }
    };
    
    return (
        
        <div className="admin-panel-container">
            <Navbar perfil={JSON.parse(sessionStorage.getItem('perfilAtivo'))} />
            <h1 style={{marginTop: "60px"}}>Painel de Administração de Conteúdo</h1>
            
            <div className="admin-form-section">
                <h2>{isEditing ? 'Editar Conteúdo' : 'Adicionar Novo Conteúdo'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Campos principais do formulário */}
                    <input name="titulo" value={formState.titulo} onChange={handleInputChange} placeholder="Título" required />
                    <textarea name="descricao" value={formState.descricao} onChange={handleInputChange} placeholder="Descrição"></textarea>
                    <input name="ano_lancamento" type="number" value={formState.ano_lancamento} onChange={handleInputChange} placeholder="Ano de Lançamento" />
                    <input name="thumbnail_url" value={formState.thumbnail_url} onChange={handleInputChange} placeholder="URL da Thumbnail" />
                    <select name="tipo_conteudo" value={formState.tipo_conteudo} onChange={handleInputChange}>
                        <option value="filme">Filme</option>
                        <option value="serie">Série</option>
                    </select>

                    {/* Campo de duração aparece apenas para filmes */}
                    {formState.tipo_conteudo === 'filme' && (
                        <input name="duracao_min" type="number" value={formState.duracao_min} onChange={handleInputChange} placeholder="Duração (minutos)" />
                    )}

                    {/* Seleção de Gêneros */}
                    <div className="genre-selection">
                        <h4>Gêneros</h4>
                        <div className="checkbox-group">
                            {generos.map(g => (
                                <label className='label' key={g.id_genero}>
                                    <input type="checkbox" checked={selectedGenres.has(g.id_genero)} onChange={() => handleGenreChange(g.id_genero)} />
                                    {g.nome}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* NOVO: Seção de Episódios Condicional */}
                    {formState.tipo_conteudo === 'serie' && (
                        <div className="episodes-section">
                            <h4>Episódios</h4>
                            {episodios.map((ep, index) => (
                                <div key={index} className="episode-input-group">
                                    <input name="titulo" value={ep.titulo} onChange={(e) => handleEpisodeChange(index, e)} placeholder={`Título do Ep. ${index + 1}`} />
                                    <input name="video_url" value={ep.video_url} onChange={(e) => handleEpisodeChange(index, e)} placeholder={`URL do Vídeo do Ep. ${index + 1}`} />
                                    <input name="numero_temporada" type="number" value={ep.numero_temporada} onChange={(e) => handleEpisodeChange(index, e)} placeholder="Temp." />
                                    <input name="numero_episodio" type="number" value={ep.numero_episodio} onChange={(e) => handleEpisodeChange(index, e)} placeholder="Ep." />
                                    <button type="button" className="remove-ep-btn" onClick={() => removeEpisodeField(index)}>–</button>
                                </div>
                            ))}
                            <button type="button" className="add-ep-btn" onClick={addEpisodeField}>+ Adicionar Episódio</button>
                        </div>
                    )}
                    
                    <div className="form-buttons">
                        <button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Conteúdo'}</button>
                        {isEditing && <button type="button" className="cancel-button" onClick={resetForm}>Cancelar Edição</button>}
                    </div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>

            {/* Seção da Lista de Conteúdos */}
            <div className="admin-list-section">
                <h2>Conteúdos Existentes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Tipo</th>
                            <th>Ano</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conteudos.map(c => (
                            <tr key={c.id_conteudo}>
                                <td>{c.titulo}</td>
                                <td>{c.tipo_conteudo}</td>
                                <td>{c.ano_lancamento}</td>
                                <td className="action-buttons">
                                    <button className="edit-btn" onClick={() => handleEdit(c)}>Editar</button>
                                    {c.tipo_conteudo === 'serie' && (
                                        <button className="episode-btn" onClick={() => setManagingEpisodesOf(c.id_conteudo)}>
                                            Episódios
                                        </button>
                                    )}
                                    <button className="delete-btn" onClick={() => handleDelete(c.id_conteudo)}>Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;