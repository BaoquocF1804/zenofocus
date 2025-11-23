const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'zenfocus.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("--- Database Tables ---");
    db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, table) => {
        if (err) console.error(err);
        else {
            db.get(`SELECT count(*) as count FROM ${table.name}`, (err, row) => {
                console.log(`Table: ${table.name}, Rows: ${row.count}`);
            });
        }
    });
});
