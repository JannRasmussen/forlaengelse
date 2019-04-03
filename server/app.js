// indlæs express
const express = require('express');
const app = express();

// knyt morgan til som logger
const logger = require('morgan');
app.use(logger('dev'));

// session
const session = require('express-session')
app.use(session({
    secret: 'jælkklkfeoævmfkoeygsgqhjwkdkvcmvmfdkjflrlgpykgmnddsbsg',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
        secure: false
    }
}));

// sæt view-engine op til at benytte ejs
app.set('view engine', 'ejs'); // definer template engine
app.set('views', './server/views'); // definerer hvor ejs filerne er placeret
app.engine('ejs', require('express-ejs-extend')); // tillad extends i ejs templates

// konfigurer bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// dette modul kan benyttes til at håndtere fileupload
const fileupload = require('express-fileupload');
// du kan selv bestemme hvor store filer der må uploades
app.use(fileupload({
    limits: {
        filesize: 10 * 1024 * 1024
    } // 10mb
}));

// altid logget ind
// app.get('*', (req, res, next) => {
//     req.session.login_id = 1;
//     next();
// })

// tjekker på alle mine "/admin" routes om man er logget ind
// app.get('/admin/*', (req, res, next) => {
//     if (req.session.login_id == undefined) {
//         res.redirect('/');
//     } else {
//         next();
//     }
// })

// dette tillader at jeg bruger de routes i den required fil
require('./routes/frontend.js')(app);
require('./routes/admin_kategorier.js')(app);

app.use(express.static('public'));

// start serveren på en port
const port = 3000;
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('App is listening on http://localhost:' + port);
});