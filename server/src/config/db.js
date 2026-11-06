const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  dbType = 'postgres';
  console.log('[DB] Using PostgreSQL connection from DATABASE_URL');
} else {
  const dbFile = process.env.DB_PATH || path.join(__dirname, '..', '..', 'store_ratings.db');
  
  // Try better-sqlite3 first (cross-platform production prebuilt binary), then fallback to node:sqlite
  try {
    const Database = require('better-sqlite3');
    sqliteDb = new Database(dbFile);
    console.log(`[DB] Using better-sqlite3 at: ${dbFile}`);
  } catch (err1) {
    try {
      const { DatabaseSync } = require('node:sqlite');
      sqliteDb = new DatabaseSync(dbFile);
      console.log(`[DB] Using node:sqlite at: ${dbFile}`);
    } catch (err2) {
      console.error('[DB] Critical: Neither better-sqlite3 nor node:sqlite could be loaded.', err2);
      throw err2;
    }
  }

  sqliteDb.exec('PRAGMA foreign_keys = ON;');
}

async function query(sql, params = []) {
  if (dbType === 'postgres') {
    let pIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
    const res = await pgPool.query(pgSql, params);
    return { rows: res.rows, rowCount: res.rowCount };
  } else {
    const trimmed = sql.trim();
    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH')) {
      const stmt = sqliteDb.prepare(sql);
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        rows: [],
        rowCount: info.changes,
        lastInsertRowid: info.lastInsertRowid
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
    sqliteDb.exec(`
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
  }
  console.log('[DB] Database schema initialized successfully');
}

module.exports = {
  query,
  initSchema,
  dbType
};
