// hent mysql modulet
const mysql = require('mysql2');

// module.exports er den kode der muliggører `require()` 
// vi får det tilbage som modulet eksporterer
// i dette modul er det en funktion kaldet `connect`
module.exports = {
    connect: () => {
        // connect returnerer den aktive forbindelse som kommer ud af `createConnection`
        return mysql.createConnection({
            'host': 'localhost',
            'user': 'root',
            // 'post': '3306',
            'password': '', // husk at angive et kodeord hvis din SQL server kræver det
            'database': 'forlaengelse'
        });
    }
};