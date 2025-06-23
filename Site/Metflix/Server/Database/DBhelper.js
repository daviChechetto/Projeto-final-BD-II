// Server/Database/DBhelper.js
const db = require('./DBConection');

function dbGet(sql, params = []) {
    return db.prepare(sql).get(params);
}

function dbAll(sql, params = []) {
    return db.prepare(sql).all(params);
}

function dbRun(sql, params = []) {
    return db.prepare(sql).run(params);
}

module.exports = {
    dbGet,
    dbAll,
    dbRun
};