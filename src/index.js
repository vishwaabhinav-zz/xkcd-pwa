const express = require('express');
const compression = require('compression');
const path = require('path');
const request = require('request');
const parser = require('body-parser');
const dbHelper = require('./modules/database-helper');
const firebaseHelper = require('./modules/firebase-helper');

const app = express();

const PORT = process.env.PORT || 3000;
const XKCD = 'http://xkcd.com/';

var db;

app.use(compression());
app.use(parser.json());
app.use(parser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname + '/static')));
app.use(express.static(path.join(__dirname + '/../dist')));
app.use(express.static(path.join(__dirname + '/..')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../dist/index.html'));
});

app.get('/latest', (req, res) => {
    request(`${XKCD}info.0.json`, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            res.json(body);
        } else {
            console.error(err);
            res
                .status(500)
                .send('Failure : ' + err);
        }
    });
});

app.get('/all', (req, res) => {
    dbHelper.getAllPosts(db)
        .then(items => res.json(items))
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .send('Failure : ' + err);
        });
});

app.get('/next', (req, res) => {
    var current = parseInt(req.query.current);

    dbHelper.getNextSetOfPosts(db, current)
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            console.error(err);
            res.status(500)
                .send('Failure: ' + err);
        });
});

app.post('/register', (req, res) => {
    if (req.body.token) {
        dbHelper.registerAuthToken(db, req.body.token)
            .then(() => res.json('Success'))
            .fail(err => {
                console.error(err);
                res.status(500)
                    .send('Failure : ' + err);
            });
    } else {
        console.error('Request didn\'t send a valid token');
        res.status(500)
            .send('Failure : Send a valid token');
    }
});

app.all('/notify', (req, res) => {
    let title = 'xkcd pwa';

    if (req.body && req.body.title) {
        title = req.body.title;
    }
    dbHelper.getAllAuthTokens(db).then(tokens => {
        return firebaseHelper.queueNotificationRequests(tokens.map(obj => obj.token), title);
    }).then(() => res.json('Success'))
        .catch(err => {
            console.error(err);
            res.status(500)
                .send('Failure :' + err);
        });
});

dbHelper.init()
    .then(database => {
        db = database;

        app.listen(PORT, () => {
            console.log(`xkcd-pwa is running on port ${PORT}`);
        });
    });
