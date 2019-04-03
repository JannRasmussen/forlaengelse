const mysql = require('../config/mysql.js');

module.exports = {

    // HENT ALLE KATEGORIER
    hent_alle_kategorier: () => {
        return new Promise((resolve, reject) => {
            // inde i dette "new promise" har vi en "readfile"
            // inde i denne her readfile, der får jeg noget data ud
            let db = mysql.connect();
            db.execute(`SELECT kategori_id, kategori_navn, kategori_billede
                FROM kategorier
                ORDER BY kategori_id DESC`,
                [], (err, rows) => {
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    else {
                        resolve(rows); // (rows[0]) når jeg ved det kun er en ting der kommer ud
                    }
                });
            db.end();
        });
    },

    // HENT EN KATEGORI
    hent_en_kategori: (kategori_id) => {
        // starter med at "return new promise" som indeholder (resolve, reject)
        return new Promise((resolve, reject) => {
            // inde i dette "new promise" har vi en "readfile"
            // inde i denne her readfile, der får jeg noget data ud
            let db = mysql.connect();
            db.execute(`SELECT kategori_id, kategori_navn, kategori_billede
            FROM kategorier
            WHERE kategori_id = ?`, [kategori_id], (err, rows) => {
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    else {
                        resolve(rows[0]);
                    }
                });
            db.end();
        });
    },

    // OPRET EN KATEGORI
    opret_en_kategori: (kategori_navn, kategori_billede) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`INSERT INTO kategorier
            SET kategori_navn = ?, kategori_billede = ?`,
                [kategori_navn, kategori_billede], (err, rows) => {
                    if (err) {
                        console.log(err.message);
                        reject(err.message);
                    }
                    else {
                        resolve(rows);
                    }
                });
            db.end();
        });
    },

    // RET EN KATEGORI
    ret_en_kategori: (kategori_navn, kategori_billede, kategori_id) => {
        console.log("hej", kategori_navn, kategori_billede, kategori_id);
        // starter med at "return new promise" som indeholder (resolve, reject)
        return new Promise((resolve, reject) => {

            // her udføre jeg den sql der normalt skal køre, når der ikke er valgt nyt billede
            let sql = `UPDATE kategorier SET kategori_navn = ?
            WHERE kategori_id = ?`;
            // sammen med dets tilhørende params
            let sql_params = [kategori_navn, kategori_id];

            // hvis kategori_billede IKKE er ''
            if (kategori_billede != '') {
                // så er det den her sql
                sql = `UPDATE kategorier SET kategori_navn = ?, kategori_billede = ?
                WHERE kategori_id = ?`;
                // sammen med dets tilhørende params
                sql_params = [kategori_navn, kategori_billede, kategori_id];
            }

            let db = mysql.connect();
            // her executer jeg mine to variabler "sql, sql_params"
            db.execute(sql, sql_params, (err, rows) => {
                if (err) {
                    console.log("ret en mysql funktion", err.message);
                    reject(err.message)
                }
                else {
                    resolve(rows);
                }
            });
            db.end();
        })
    },

    // SLET EN KATEGORI
    slet_en_kategori: (kategori_id) => {
        return new Promise((resolve, reject) => {
            let db = mysql.connect();
            db.execute(`DELETE FROM kategorier
            WHERE kategori_id = ?`,
                [kategori_id], (err, rows) => {
                    if (err) {
                        reject(err.message);
                    }
                    else {
                        resolve(rows);
                    }
                })
        })
    }
}