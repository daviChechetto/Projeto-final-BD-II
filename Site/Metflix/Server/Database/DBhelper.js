// Server/Database/DBhelper.js

const db = require('./DBConection');

// As funções agora são síncronas, não precisam mais de 'Async' no nome

function dbGetAsync(sql, params = []) {
    // Prepara a query e executa .get()
    return db.prepare(sql).get(params);
}

function dbAllAsync(sql, params = []) {
    // Prepara a query e executa .all()
    return db.prepare(sql).all(params);
}

function dbRunAsync(sql, params = []) {
    // Prepara a query e executa .run()
    // Retorna um objeto com { changes, lastInsertRowid }
    return db.prepare(sql).run(params);
}

module.exports = {
    dbGetAsync,
    dbAllAsync,
    dbRunAsync
};