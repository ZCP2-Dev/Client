const sqlite3 = require('sqlite3').verbose();

export default class database {
    constructor() {
        this.db = new sqlite3.Database('data.db');
    };
    runQuery(query) {
        const result = this.db.run(query);
    };
    getQuery(query) {
        this.db.all(query,(err,rows)=>{
            if (err) return err;
            if (rows) return rows;
        });
    };
    close() {
        this.db.close();
    };
}