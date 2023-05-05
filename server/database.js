const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database("database.db");
    }

    createTable(tableName, fields) {
        const fieldString = Object.entries(fields).map(([fieldName, fieldType]) => {
            return `${fieldName} ${fieldType}`;
        }).join(', ');

        const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fieldString})`;
        this.db.run(createTableSql);

        console.log(`${tableName} table created`);
    }

    dropTable(tableName) {
        this.db.run(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`${tableName} table dropped if exists`);
    }

    insertToTable(tableName, fields, values) {
        const fieldString = fields.join(", ");
        const placeholders = fields.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${fieldString}) VALUES (${placeholders})`;

        this.db.run(sql, [...values]);
    }

    query(sql, params = []) {
        return new Promise((res, rej) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    rej(err);
                }
                else {
                    res(rows);
                }
            });
        });
    }

    close() {
        this.db.close();
    }
}

const db = new Database();

db.createTable("messages", {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    user: "TEXT",
    time: "TEXT",
    body: "TEXT"
});
const fields = ["user", "time", "body"];
const values = ["Luigi", "11:11:11", "test message"];
db.insertToTable("messages", fields, values);
// let promise = db.getTableCount("messages")
// .then(results => {
//     console.log(results);
// })

module.exports = Database;