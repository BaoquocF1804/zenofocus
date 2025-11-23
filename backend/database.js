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
    // Settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    focusDuration INTEGER,
    shortBreakDuration INTEGER,
    longBreakDuration INTEGER,
    dailyGoalHours REAL
  )`);

    // Initialize default settings if not exists
    db.get("SELECT * FROM settings LIMIT 1", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO settings (focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours) VALUES (25, 5, 15, 4)`);
        }
    });

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    completed INTEGER,
    createdAt INTEGER
  )`);

    // Sessions (History) table
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    mode TEXT,
    duration INTEGER,
    completedAt INTEGER
  )`);

    // Theme table
    db.run(`CREATE TABLE IF NOT EXISTS theme (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currentTheme TEXT
  )`);

    // Initialize default theme if not exists
    db.get("SELECT * FROM theme LIMIT 1", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO theme (currentTheme) VALUES ('nature')`);
        }
    });
});

module.exports = db;
