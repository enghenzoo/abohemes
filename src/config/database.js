const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(process.env.DATABASE_NAME);

module.exports = { db };
