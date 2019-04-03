// tilknytter denne fil med en service fil
// const forside_service = require('../services/forside.js');

module.exports = (app) => {

    // FORSIDE
    app.get('/', (req, res) => {
        // send data til skabelonen
        res.render('pages/forside', {
            "title": "Kategori administration",
            "page": "forside",
            "session": req.session
        });
    });

}