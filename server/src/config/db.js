const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;
const dbFile = process.env.DB_PATH || path.join(__dirname, '..', '..', 'store_ratings.db');

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  dbType = 'postgres';
  console.log('[DB] Using PostgreSQL connection from DATABASE_URL');
}

async function ensureDb() {
  if (dbType === 'postgres') return;
  if (!sqliteDb) {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    if (fs.existsSync(dbFile)) {
      const fileBuffer = fs.readFileSync(dbFile);
      sqliteDb = new SQL.Database(fileBuffer);
    } else {
      sqliteDb = new SQL.Database();
    }
    sqliteDb.run('PRAGMA foreign_keys = ON;');
    console.log(`[DB] Using portable WASM SQLite at: ${dbFile}`);
  }
}

function persistDb() {
  if (dbType === 'sqlite' && sqliteDb) {
    try {
      const data = sqliteDb.export();
      fs.writeFileSync(dbFile, Buffer.from(data));
    } catch (e) {
      console.error('[DB] Error saving to disk:', e);
    }
  }
}

async function query(sql, params = []) {
  if (dbType === 'postgres') {
    let pIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
    const res = await pgPool.query(pgSql, params);
    return { rows: res.rows, rowCount: res.rowCount };
  } else {
    await ensureDb();
    const trimmed = sql.trim();
    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH')) {
      const stmt = sqliteDb.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return { rows, rowCount: rows.length };
    } else {
      sqliteDb.run(sql, params);
      let lastInsertRowid = null;
      let changes = 0;
      try {
        const idRes = sqliteDb.exec('SELECT last_insert_rowid() AS id');
        if (idRes && idRes[0] && idRes[0].values) {
          lastInsertRowid = idRes[0].values[0][0];
        }
        const changeRes = sqliteDb.exec('SELECT changes() AS cnt');
        if (changeRes && changeRes[0] && changeRes[0].values) {
          changes = changeRes[0].values[0][0];
        }
      } catch (err) {
        // ignore
      }
      persistDb();
      return {
        rows: [],
        rowCount: changes,
        lastInsertRowid
      };
    }
  }
}

async function initSchema() {
  if (dbType === 'postgres') {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
    `);
  } else {
    await ensureDb();
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        address TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, store_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
    `);
    persistDb();
  }
  console.log('[DB] Database schema initialized successfully');
}

module.exports = {
  query,
  initSchema,
  dbType
};
