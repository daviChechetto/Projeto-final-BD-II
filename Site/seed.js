// seed.js
const sqlite3 = require('sqlite3').verbose();

// Define o nome do arquivo do banco de dados
const DB_FILE = 'metflix.db';

// Cria uma nova instância do banco de dados (isso cria o arquivo)
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados', err.message);
        return;
    }
    console.log(`Conectado ao banco de dados ${DB_FILE}.`);
});

// db.serialize garante que os comandos rodem em sequência
db.serialize(() => {
    console.log('Iniciando a criação das tabelas...');

    // Executa cada comando CREATE TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS Planos (
          id_plano INTEGER PRIMARY KEY, nome VARCHAR(100) NOT NULL, preco DECIMAL(10,2), qualidade_max VARCHAR(50), telas_max INTEGER
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Usuarios (
          id_usuario INTEGER PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, senha_hash VARCHAR(255) NOT NULL, id_plano INTEGER, status TEXT, data_criado TIMESTAMP, data_modificado TIMESTAMP, is_admin BOOLEAN DEFAULT FALSE, FOREIGN KEY (id_plano) REFERENCES Planos(id_plano)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Perfis (
          id_perfil INTEGER PRIMARY KEY, id_usuario INTEGER NOT NULL, nome VARCHAR(100) NOT NULL, avatar_url VARCHAR(255), FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Conteudos (
          id_conteudo INTEGER PRIMARY KEY, titulo VARCHAR(255) NOT NULL, descricao TEXT, ano_lancamento INTEGER, duracao_min INTEGER, tipo_conteudo TEXT, thumbnail_url VARCHAR(255)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Episodios (
          id_episodio INTEGER PRIMARY KEY, id_conteudo INTEGER NOT NULL, titulo VARCHAR(255), numero_temporada INTEGER, numero_episodio INTEGER, duracao_min INTEGER, video_url VARCHAR(255), FOREIGN KEY (id_conteudo) REFERENCES Conteudos(id_conteudo)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Generos (
          id_genero INTEGER PRIMARY KEY, nome VARCHAR(100) UNIQUE NOT NULL
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Conteudo_Genero (
          id_conteudo INTEGER NOT NULL, id_genero INTEGER NOT NULL, PRIMARY KEY (id_conteudo, id_genero), FOREIGN KEY (id_conteudo) REFERENCES Conteudos(id_conteudo), FOREIGN KEY (id_genero) REFERENCES Generos(id_genero)
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Minha_Lista (
          id_minha_lista INTEGER PRIMARY KEY, id_perfil INTEGER NOT NULL, id_conteudo INTEGER NOT NULL, data_adicao TIMESTAMP, FOREIGN KEY (id_perfil) REFERENCES Perfis(id_perfil), FOREIGN KEY (id_conteudo) REFERENCES Conteudos(id_conteudo)
        );  
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Historicos (
          id_historico INTEGER PRIMARY KEY, id_perfil INTEGER NOT NULL, id_conteudo INTEGER NOT NULL, id_episodio INTEGER, progresso_seg INTEGER, data_visualizacao TIMESTAMP, FOREIGN KEY (id_perfil) REFERENCES Perfis(id_perfil), FOREIGN KEY (id_conteudo) REFERENCES Conteudos(id_conteudo), FOREIGN KEY (id_episodio) REFERENCES Episodios(id_episodio)
        );
    `, (err) => {
        if(err) console.error("Erro ao criar última tabela:", err.message);
        else console.log('Tabelas criadas com sucesso.');
    });

    console.log('Inserindo dados iniciais (seed)...');

    // Insere os dados iniciais
    db.run(`
        INSERT INTO Planos (id_plano, nome, preco, qualidade_max, telas_max) VALUES
        (1, 'Básico com Anúncios', 18.90, 'Full HD (1080p)', 2),
        (2, 'Padrão', 39.90, 'Full HD (1080p)', 2),
        (3, 'Premium', 55.90, 'Ultra HD (4K) + HDR', 4);
    `);
    db.run(`
        INSERT INTO Generos (id_genero, nome) VALUES
        (1, 'Ação'), (2, 'Comédia'), (3, 'Drama'), (4, 'Ficção Científica');
    `, (err) => {
        if(err) console.error("Erro ao inserir dados:", err.message);
        else console.log('Dados iniciais inseridos com sucesso.');
    });
});

// Fecha a conexão com o banco de dados
db.close((err) => {
    if (err) {
        return console.error('Erro ao fechar o banco de dados', err.message);
    }
    console.log('Conexão com o banco de dados fechada.');
});