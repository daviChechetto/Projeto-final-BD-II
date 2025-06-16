import { useState, useEffect, useCallback } from 'react';
import initSqlJs from 'sql.js';

// CORREÇÃO: Caminho para o arquivo .wasm a partir da raiz do servidor.
const SQL_WASM_PATH = '/sql-wasm.wasm';

// Instância do DB fora do componente para persistir.
let dbInstance = null;

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDb = async () => {
      // Previne reinicialização desnecessária.
      if (dbInstance) {
          setIsReady(true);
          return;
      }
      
      try {
        const SQL = await initSqlJs({ locateFile: file => SQL_WASM_PATH });

        // CORREÇÃO: Busca o arquivo .db a partir da raiz do servidor.
        const response = await fetch('/metflix.db');

        if (!response.ok) {
            throw new Error(`Falha ao buscar o banco de dados: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const u8array = new Uint8Array(arrayBuffer);

        dbInstance = new SQL.Database(u8array);
        console.log("Banco de dados carregado com sucesso a partir do arquivo metflix.db!");

        setIsReady(true);

      } catch (err) {
        console.error("Erro ao inicializar o banco de dados a partir do arquivo:", err);
        setError(err);
      }
    };

    initializeDb();
  }, []); // Array de dependência vazio para rodar apenas uma vez.

  
  // O resto do seu código já estava correto.

  const query = useCallback((sql, params = []) => {
    if (!isReady || !dbInstance) throw new Error("O banco de dados não está pronto.");
    const results = [];
    try {
        const stmt = dbInstance.prepare(sql, params);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
    } catch (err) {
        console.error("Erro na query:", err);
        throw err;
    }
    return results;
  }, [isReady]);

  const insert = useCallback((tableName, dataObject) => {
    if (!isReady || !dbInstance) throw new Error("O banco de dados não está pronto.");
    try {
      const columns = Object.keys(dataObject).join(", ");
      const placeholders = Object.keys(dataObject).map(() => "?").join(", ");
      const values = Object.values(dataObject);
      
      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders});`;
      dbInstance.run(sql, values);
    } catch (err) {
        console.error("Erro ao inserir:", err);
        throw err;
    }
  }, [isReady]);

  const update = (tableName, dataObject, whereObject) => {
    if (!isReady || !dbInstance) throw new Error("O banco de dados não está pronto.");
    try {
        const setClause = Object.keys(dataObject).map(key => `${key} = ?`).join(", ");
        const whereClause = Object.keys(whereObject).map(key => `${key} = ?`).join(" AND ");
        const values = [...Object.values(dataObject), ...Object.values(whereObject)];

        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;
        dbInstance.run(sql, values);
    } catch (err) {
        console.error("Erro ao atualizar:", err);
        throw err;
    }
  };

  const deleteRow = (tableName, whereObject) => {
    if (!isReady || !dbInstance) throw new Error("O banco de dados não está pronto.");
    try {
        const whereClause = Object.keys(whereObject).map(key => `${key} = ?`).join(" AND ");
        const values = Object.values(whereObject);

        const sql = `DELETE FROM ${tableName} WHERE ${whereClause};`;
        dbInstance.run(sql, values);
    } catch (err) {
        console.error("Erro ao deletar:", err);
        throw err;
    }
  };

  const upsertHistory = (profileId, contentId, episodeId, progressSeconds) => {
    if (!isReady || !dbInstance) throw new Error("O banco de dados não está pronto.");
    try {
      const updateSql = `
        UPDATE Historicos 
        SET progresso_seg = ?, data_visualizacao = CURRENT_TIMESTAMP
        WHERE id_perfil = ? AND id_conteudo = ? AND (id_episodio = ? OR (? IS NULL AND id_episodio IS NULL));
      `;
      dbInstance.run(updateSql, [progressSeconds, profileId, contentId, episodeId, episodeId]);

      if (dbInstance.getRowsModified() === 0) {
        const insertSql = `
          INSERT INTO Historicos (id_perfil, id_conteudo, id_episodio, progresso_seg, data_visualizacao)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
        `;
        dbInstance.run(insertSql, [profileId, contentId, episodeId, progressSeconds]);
      }
    } catch (err) {
      console.error("Erro ao atualizar histórico:", err);
      throw err;
    }
  };

  // Envolvemos as funções em useCallback para otimização, mas as suas já funcionam.
  return { isReady, error, query, insert, update, deleteRow, upsertHistory };
};