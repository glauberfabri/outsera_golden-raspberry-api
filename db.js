const db = require('sqlite3').verbose();
const database = new db.Database(':memory:');

// Cria a tabela movies se ela não existir
database.serialize(() => {
    database.run(`CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER,
        title TEXT,
        studios TEXT,
        producers TEXT,
        winner INTEGER
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Table 'movies' created successfully.");
        }
    });
});

module.exports = database;
