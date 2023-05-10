const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database("database.db");
    }

    async createTable(tableName, fields) {
        const fieldString = Object.entries(fields).map(([fieldName, fieldType]) => {
            return `${fieldName} ${fieldType}`;
        }).join(', ');

        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${fieldString})`;
        try {
            const result = await this.executeNonQuery(sql);
            console.log(`Table ${tableName} created with result ${result}`);
        }
        catch (err) {
            console.error(`Error creating table ${tableName}: ${err}`);
        }
    }

    async dropTable(tableName) {
        const sql = `DROP TABLE IF EXISTS ${tableName}`;
        try {
            const result = await this.executeNonQuery(sql);
            console.log(`Table ${tableName} deleted with result ${result}`);
        }
        catch (err) {
            console.error(`Error deleting table ${tableName}: ${err}`);
        }
    }

    async insertToTable(tableName, fields, values) {
        const fieldString = fields.join(", ");
        const placeholders = fields.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${fieldString}) VALUES (${placeholders})`;

        try {
            const result = await this.executeNonQuery(sql, [...values]);
            console.log(`Inserted to table ${tableName} with result ${result}`);
        }
        catch (err) {
            console.error(`Error inserting to table ${tableName}: ${err}`);
        }
    }

    async deleteFromTable(tableName, field, value) {
        const sql = `DELETE FROM ${tableName} WHERE ${field}="${value}";`
        try {
            const result = await this.executeNonQuery(sql);
            console.log(`Deleted from table ${tableName} with result ${result}`);
        }
        catch (err) {
            console.error(`Error deleting from table ${tableName}: ${err}`);
        }
    }

    // returns a promise
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

    executeNonQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.lastID || this.changes);
                }
            });
        });
    }

    close() {
        this.db.close();
    }
}

const db = new Database();

db.createTable("users", {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    name: "TEXT"
})

db.createTable("messages", {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    user: "TEXT",
    time: "TEXT",
    body: "TEXT"
});

db.close();
module.exports = Database;