// Server/Database/DBConection.js

const Database = require('better-sqlite3');

const dbPath = './Database/database.db';
const db = new Database(dbPath, { verbose: console.log }); // verbose é um parâmetro de opções

// Ativa o suporte a chaves estrangeiras
db.pragma('foreign_keys = ON');

// --- REGISTRO DAS FUNÇÕES CUSTOMIZADAS (API do better-sqlite3) ---

// FUNÇÃO 1: CALCULAR_PROGRESSO_PERCENTUAL
db.function('CALCULAR_PROGRESSO_PERCENTUAL', { deterministic: true }, (progresso_seg, duracao_min) => {
    if (progresso_seg === null || duracao_min === null || duracao_min <= 0) {
        return 0;
    }
    const duracao_seg = duracao_min * 60;
    if (duracao_seg === 0) return 0;
    const percentual = (progresso_seg / duracao_seg) * 100;
    return Math.min(100, Math.round(percentual));
});

// FUNÇÃO 2: FORMATAR_NOME_PLANO
db.function('FORMATAR_NOME_PLANO', { deterministic: true }, (nome_plano, qualidade) => {
    if (!nome_plano) return 'Plano Inválido';
    return qualidade ? `${nome_plano} (${qualidade})` : nome_plano;
});

// FUNÇÃO 3: FORMATAR_DURACAO
db.function('FORMATAR_DURACAO', { deterministic: true }, (duracao_min) => {
    if (duracao_min === null || duracao_min <= 0) {
        return '';
    }
    const horas = Math.floor(duracao_min / 60);
    const minutos = duracao_min % 60;
    if (horas > 0) {
        return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
});

console.log('Conectado ao banco SQLite com better-sqlite3 e funções registradas.');

module.exports = db;