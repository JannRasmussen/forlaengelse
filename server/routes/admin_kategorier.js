const kategori_service = require('../services/kategorier.js');

const path = require('path');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

module.exports = (app) => {

    // (hent alle)
    // (hent alle) ADMINISTRATIONS PANELETS FORSIDE (VISER LISTEN)
    app.get('/admin/kategorier', (req, res) => {
        (async () => {
            try {
                // standard data
                let alle_kategorier = [];
                let en_kategori = {
                    "kategori_id": 0,
                    "kategori_navn": "",
                    "kategori_billede": ""
                }

                // udfør de asynkrone funktioner med en await kommando
                await kategori_service.hent_alle_kategorier()
                    .then(result => {
                        alle_kategorier = result;
                    });
                // console.log(alle_kategorier);
                // send data til skabelonen
                res.render('pages/admin_kategori', {
                    "title": "Administration for kategorier",
                    "alle_kategorier": alle_kategorier,
                    "en_kategori": en_kategori,
                    "formtype": "Opret",
                    "page": "admin_kategori",
                    "session": req.session, // dette er tilføjelsen som sender session med.
                    "fejl_besked": ""
                });
            }
            catch (error) {
                console.log(error);
            }
        })();
    });

    // (opret)
    // (indsæt en) TAG I MOD FORMULAR DATA OG INDSÆT EN NY KATEGORI
    app.post('/admin/kategorier', (req, res) => {
        // Validering
        // Opret tomt array til fejlbeskeder
        let fejl_besked = [];
        let kategori_navn = req.body.kategori_navn;
        if (kategori_navn == undefined || kategori_navn == "") {
            fejl_besked.push('Indtast et kategori navn')
        }

        let kategori_billede = req.files.kategori_billede;
        let exten = ".jpg";
        if (kategori_billede == undefined || kategori_billede == "") {
            fejl_besked.push('Indsæt et billede')
        } else {
            exten = path.extname(kategori_billede.name).toLowerCase();
            console.log(exten);
            if (exten != ".jpg" && exten != ".png") {
                fejl_besked.push('forkert billede format');
            }
        }
        // Hvis fejlbesked arrayet indeholder elementer, betyder det at noget er gået galt,
        // Derfor returneres fejlbesked arrayet så klienten kan se besked i konsol
        if (fejl_besked.length > 0) {
            (async () => {
                try {
                    // standard data
                    let alle_kategorier = [];
                    let en_kategori = {
                        "kategori_id": 0,
                        "kategori_navn": "",
                        "kategori_billede": ""
                    }

                    res.render('pages/admin_kategori', {
                        "title": "Administartion for kategorier",
                        "alle_kategorier": alle_kategorier,
                        "en_kategori": en_kategori,
                        "formtype": "Opret",
                        "page": "admin_kategori",
                        "session": req.session,
                        "fejl_besked": fejl_besked.join(", ")
                    });
                } catch (error) {
                    console.log(error);
                }
            })();
        } else {
            let billede_navn = uuidv4() + exten;
            let upload_location = path.join(__dirname, '..', '..', 'public', 'billeder', billede_navn);

            // benyt mv() for at flytte billedet
            kategori_billede.mv(upload_location, (err) => {
                if (err) {
                    console.log(err);
                }

                kategori_service.opret_en_kategori(kategori_navn, billede_navn)
                    .then(result => {
                        console.log("kategori er oprettet");
                        res.redirect('/admin/kategorier');
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/admin/kategorier');
                    });
            })
        }
    });

    // (forudfyld form)
    // (henter en) FORUDFYLD FORMULAREN MED EN KATEGORI
    app.get('/admin/kategori/ret/:kategori_id', (req, res) => {
        let kategori_id = req.params.kategori_id;
        if (isNaN(kategori_id)) {
            res.redirect('/admin/kategorier')
        }
        else {
            (async () => {
                try {
                    // standard data
                    let fejl_besked = [];
                    let alle_kategorier = [];
                    let en_kategori = {
                        "kategori_id": 0,
                        "kategori_navn": "",
                        "kategori_billede": ""
                    }

                    // udfør de asynkrone funktioner med en await kommando
                    await kategori_service.hent_en_kategori(kategori_id)
                        .then(result => {
                            en_kategori = result;
                        });

                    // send data til skabelonen
                    res.render('pages/admin_kategori', {
                        "title": "Administration for kategorier",
                        "formtype": "Rediger",
                        "alle_kategorier": alle_kategorier,
                        "en_kategori": en_kategori,
                        "page": "admin_kategorier",
                        "session": req.session, // dette er tilføjelsen som sender session med.
                        "fejl_besked": fejl_besked.join(", ")
                    });
                }
                catch (error) {
                    console.log(error);
                }
            })();
        }
    });

    // (ret)
    // (opdater en) TAG I MOD EN REDIGER FORMULAR, OG OPDATER DATABASEN
    app.post('/admin/kategori/ret/:kategori_id', (req, res) => {
        if (isNaN(req.params.kategori_id)) {
            res.redirect("/admin/kategorier"); // BAD REQUEST
        } else {
            // Validering
            // Opret tomt array til fejlbeskeder
            let fejl_besked = [];
            let kategori_id = req.params.kategori_id;

            let kategori_navn = req.body.kategori_navn;
            if (kategori_navn == undefined || kategori_navn == "") {
                fejl_besked.push('Indtast et kategori navn')
            }

            let kategori_billede = req.files.kategori_billede;
            let billede_navn = "";

            // Hvis fejlbesked arrayet indeholder elementer, betyder det at noget er gået galt,
            // Derfor returneres fejlbesked arrayet så klienten kan se besked i konsol
            if (fejl_besked.length > 0) {
                // vis fejlbesked
                console.log("kunne ikke oprette kategori");
                res.redirect("/admin/produkter");
            } else {
                // hvis der er sendt et billede til denne POST route, så skal vi håndtere uploaden
                if (kategori_billede != undefined) {
                    let exten = path.extname(kategori_billede.name).toLowerCase();
                    if (exten == ".jpg" || exten == ".png") {
                        // hvis der er et gammelt billede, så sletter vi først det
                        let gammelt_billede_navn = req.body.gammelt_billede;
                        if (gammelt_billede_navn != undefined && gammelt_billede_navn != "" && gammelt_billede_navn != "no_img.png") {
                            let delete_location = path.join(__dirname, '..', '..', 'public', 'billeder', gammelt_billede_navn);
                            if (fs.existsSync(delete_location)) {
                                fs.unlinkSync(delete_location)
                            }
                        }

                        billede_navn = uuidv4() + exten;
                        let upload_location = path.join(__dirname, '..', '..', 'public', 'billeder', billede_navn);

                        // benyt mv() for at flytte billedet
                        kategori_billede.mv(upload_location, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        })
                    }
                }

                kategori_service.ret_en_kategori(kategori_navn, billede_navn, kategori_id)
                    .then(result => {
                        console.log("kategorien er rettet");
                        res.redirect('/admin/kategorier');
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/admin/kategorier');
                    });
            }
        }
    });

    // (slet)
    app.get('/admin/kategori/slet/:kategori_id', (req, res) => {
        if (isNaN(req.params.kategori_id)) {
            res.redirect("/admin/kategorier"); // BAD REQUEST
        } else {
            // her fortæller jeg at det der er i min variable, er den kategori_id som er i min params
            let kategori_id = req.params.kategori_id;
            kategori_service.hent_en_kategori(kategori_id)
                .then(result => {
                    if (result.kategori_billede != undefined && result.kategori_billede != "" && result.kategori_billede != "no_img.png") {
                        let delete_location = path.join(__dirname, '..', '..', 'public', 'billeder', result.kategori_billede);
                        if (fs.existsSync(delete_location)) {
                            fs.unlinkSync(delete_location)
                        }
                    }

                    kategori_service.slet_en_kategori(kategori_id)
                        .then(result => {
                            console.log("kategorien er blevet slettet");
                            res.redirect("/admin/kategorier");
                        })
                        .catch(error => {
                            console.log(error);
                            res.redirect("/admin/kategorier");
                        })
                })
                .catch(error => {
                    console.log(error);
                })
        }
    });
}