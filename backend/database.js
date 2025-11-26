const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'zenfocus.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        createdAt INTEGER
    )`);

    // Settings table - now with user_id
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        focusDuration INTEGER DEFAULT 25,
        shortBreakDuration INTEGER DEFAULT 5,
        longBreakDuration INTEGER DEFAULT 15,
        dailyGoalHours REAL DEFAULT 4,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Tasks table - now with user_id
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        completed INTEGER,
        createdAt INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Sessions (History) table - now with user_id
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        mode TEXT,
        duration INTEGER,
        completedAt INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Theme table - now with user_id
    db.run(`CREATE TABLE IF NOT EXISTS theme (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        currentTheme TEXT DEFAULT 'nature',
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Migration: Add user_id column to existing tables if not exists
    db.all("PRAGMA table_info(settings)", (err, columns) => {
        const hasUserId = columns && columns.some(col => col.name === 'user_id');
        if (!hasUserId) {
            db.run("ALTER TABLE settings ADD COLUMN user_id TEXT", (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Migration error (settings):', err);
                }
            });
        }
    });

    db.all("PRAGMA table_info(tasks)", (err, columns) => {
        const hasUserId = columns && columns.some(col => col.name === 'user_id');
        if (!hasUserId) {
            db.run("ALTER TABLE tasks ADD COLUMN user_id TEXT", (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Migration error (tasks):', err);
                }
            });
        }
    });

    db.all("PRAGMA table_info(sessions)", (err, columns) => {
        const hasUserId = columns && columns.some(col => col.name === 'user_id');
        if (!hasUserId) {
            db.run("ALTER TABLE sessions ADD COLUMN user_id TEXT", (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Migration error (sessions):', err);
                }
            });
        }
    });

    db.all("PRAGMA table_info(theme)", (err, columns) => {
        const hasUserId = columns && columns.some(col => col.name === 'user_id');
        if (!hasUserId) {
            db.run("ALTER TABLE theme ADD COLUMN user_id TEXT", (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Migration error (theme):', err);
                }
            });
        }
    });
});

module.exports = db;
