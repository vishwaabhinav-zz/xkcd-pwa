const express = require('express');
const compression = require('compression');
const path = require('path');
const http = require('http');
const request = require('request');
const mp = require('mongodb-promise');
const push = require('web-push');
const firebase = require('firebase-admin');
const parser = require('body-parser');
const rp = require('request-promise');

firebase.initializeApp({
    credential: firebase.credential.cert({
        'projectId': 'xkcd-pwa',
        'client_email': "firebase-adminsdk-b84di@xkcd-pwa.iam.gserviceaccount.com",
        'private_key': "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyEjz1LsPpGxXW\nZLqYfJufLeu5O0uo8gSTYW57mMguCv0iK938GvYKx1/gRKMZ2FuufLOAoY/GZriE\nwDGUj5zA2gDfZyjWOi6+O1MjohZD/IU2rcn2fMPGeZJxnt2fdgZ28XuajcKh5X6f\n8t4c2FqO5t4IwZpdlG/oRgQI1RL7dawa0EqLffE0cGG4/3aO6Vxi6pc6BvLvh8uB\neue6/9faj2UdmP9+XsxyHKTnsLneYz9+1R9r/vc2xYgPcon1uhnAcwmCdY6zNa1p\nRx10JDhTAavnPn+0YYNzRNfBiL7FXuF5drAUN3NgC1mH9INKD3fY7DZagJgv1qNJ\nmwga9jjvAgMBAAECggEATAcHabM+x+7dgvzcwjApjWvgweQ0KHy0QWyO7ExN44Kj\nkwxhqbqlI/L911XWwTkj47qwNRJFvXKsA1m/kWtDhP9O8hMsV1LeFDBmDcetc/eD\ntNW8bfXU7I+JW+N1Qhj1J6FwoYs290Jxrr7V4EDrYSnm0JxAWQYARY5nOJIomZ1s\nN+WsWSpptk8AQNdiSsN+CGVPcQi+zplHHbe4/SAcdG/z/ELLKAEr1axvKBO5VMTd\nokn0gKg3EUso+hyu7VrjAKBgs5xfbosGkMRPX4+1M12jYF45Q5SXc24HsDyzrXw9\nNu7rc4ONXDily4zHo375TseBKTzwtFSwclDD+Hgn2QKBgQDmRd+JYq/oEuguh+g4\nlDE7j6sgPalXUxx0RCuc8qpIQPjwY5W8CfUmZCU043dWq6ApKJVSYfA/6HEUa7qM\ncsOIFDVlNbQL1hTUWbo0KG9QKcijtdSHbq79oaCe3T+ADSHaKgmXtlPc6UzFrRss\nMUYi7FGmPEWJ/LTLonJZUY1tSwKBgQDF91LZO2g1KwECG8SD2XSJaxeAzwobFPBs\n+ktXqBw8mpAcnoDnXwmYFdnAGk1NIFDUfVsolqBVyAwGdhO+8y2bRk69B6SnlsI3\n1nrN1NddS7wKMlUfWYZSxFWYFdfQz2xCPzjQXBF9YRH69DIe+6skQOL8zVx1kDq/\niTZLQH4QbQKBgQC/6wp0eZC8bk2ewlzUEwa5anMoitvBUR6M9GgZBdLQJ36S85zP\nPMlaNusfmllTHfV9eDqDj+bpjLP6XhL7jYbTumwKL2kg2EtB9IqRgAXOHRUBBMHe\nImysLPIulZ2f/tHw/0pBbI+WtcbrlevouCSJZMZkMyWN7NVORtThBmxF4wKBgBCa\nBSCiksKisJr0qS5Fdjhv+rCarEZJI0CAXQEk3/lVHPDJehXtKmjOrEwn6IOnSiAH\nwzVMLHYFKL0B+fXxfsmew8umcHB9fBwiqHnKd6UjTMmuHuVaJKGcRXFTo52nR3Tm\nyGTw06aoFVHuWKWwhVGs/1wj/LT/O24Em8EDz46hAoGBAK3mv0kegsPIEAzLb6te\nCmY691EaWScHuy9K88fW6bMq5gI5A3cruG9ezQmSVnMpk2oWUrfw7Jn5t29aAv1M\nYVcu84xnDMSlppE/BrApkhH4tcucByQMeIxX+LnWp+Fkm8/JgbGF70ZQZ96Ury1y\n9xnU0HMXh1f7janMWH7H0L/8\n-----END PRIVATE KEY-----\n"
    }),
    databaseURL: "https://xkcd-pwa.firebaseio.com"
});

const app = express();

const PORT = process.env.PORT || 3000;
const XKCD = 'http://xkcd.com/';
const dbstr = 'mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b';
const serverKey = 'AAAAhb7KDIU:APA91bF0lsmQX6QDR9aYY2KIGu6yMz9E8IRlckDWQnzKxrBmOql7WXrZYXj7t5UO6xjJw_qSn5Zgt06zd5xc7EBZYYUUC8zqiPGhzOgV3lKCXfecIOb1m8-gODrlRKop80BuEsb-vDiV8MqR4gLEtH0SaiNQxUg88w';

var db;

app.use(compression());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/views/index.html'));
});

app.get('/latest', (req, res) => {
    request(`${XKCD}info.0.json`, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            res.json(body);
        } else {
            console.error(err);
            res.status(500).send('Failure : ' + err);
        }
    });
});

app.get('/all', (req, res) => {
    db.collection('records').then(col => {
        col.find()
            .sort({
                "num": -1
            })
            .toArray()
            .then(items => res.json(items))
            .catch(err => {
                console.log(err);
                res.status(500).send('Failure : ' + err);
            });
    });
});

app.get('/next', (req, res) => {
    var current = parseInt(req.query.current);

    db.collection('records').then(col => {
        let promise;
        let limit = 100;
        if (current === -1) {
            promise = col.find();
            limit = 10;
        } else {
            promise = col.find({
                "num": { "$lt": current }
            });
        }

        promise.sort({
            "num": -1
        }).limit(limit)
            .toArray()
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Failure: ' + err);
            });
    });
});

app.post('/register', (req, res) => {
    if (req.body.token) {
        db.collection('token')
            .then(collection => collection.update({ 'token': req.body.token }, {
                'token': req.body.token
            }, { upsert: true }))
            .then(result => console.log(result))
            .then(() => res.json('Success'))
            .fail(err => {
                console.error(err);
                res.status(500).send('Failure : ' + err);
            });
    } else {
        console.error('Request didn\'t send a valid token');
        res.status(500).send('Failure : Send a valid token');
    }
});

function _getAllTokens() {
    return db.collection('token')
        .then(collection => collection.find().toArray());
}

function _sendNotification(token, title) {
    var options = {
        method: 'POST',
        uri: 'http://fcm.googleapis.com/fcm/send',
        body: {
            "notification": {
                "title": title,
                "body": 'new comic got uploaded. check it out..',
                "icon": 'images/large.png',
                "click_action": 'https://xkcd-pwa.herokuapp.com'
            },
            "to": token,
            "time_to_live": 3
        },
        headers: {
            Authorization: 'key=AAAAhb7KDIU:APA91bF0lsmQX6QDR9aYY2KIGu6yMz9E8IRlckDWQnzKxrBmOql7WXrZYXj7t5UO6xjJw_qSn5Zgt06zd5xc7EBZYYUUC8zqiPGhzOgV3lKCXfecIOb1m8-gODrlRKop80BuEsb-vDiV8MqR4gLEtH0SaiNQxUg88w',
            'content-type': 'application/json'
        },
        json: true // Automatically stringifies the body to JSON
    };

    return rp(options)
        .then(resp => console.log(resp))
        .catch(err => console.log(err));
}

function _queueNotificationRequests(tokens, title) {
    var promiseArr = [];
    tokens.forEach(token => {
        promiseArr.push(_sendNotification(token, title));
    });
    return Promise.all(promiseArr);
}

app.all('/notify', (req, res) => {
    let title = 'xkcd pwa';

    if (req.body && req.body.title) {
        title = req.body.title;
    }
    _getAllTokens().then(tokens => {
        return _queueNotificationRequests(tokens.map(obj => obj.token), title);
    }).then(() => res.json('Success'))
        .catch(err => {
            console.error(err);
            res.status(500).send('Failure :' + err);
        });
});

mp.MongoClient.connect(dbstr)
    .then(database => {
        db = database;

        app.listen(PORT, () => {
            console.log(`xkcd-pwa is running on port ${PORT}`);
        });
    });
