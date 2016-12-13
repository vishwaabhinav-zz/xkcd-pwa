const express = require('express');
const compression = require('compression');
const path = require('path');
const http = require('http');
const request = require('request');
const mp = require('mongodb-promise');
const push = require('web-push');
const firebase = require('firebase-admin');

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

var db;

app.use(compression());
app.use(express.static('static'));
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/views/index.html'));
});

app.get('/latest', (req, res) => {
  request(`${XKCD}info.0.json`, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      res.json(body);
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
      .catch(err => console.log(err));
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
    })
      .limit(limit)
      .toArray()
      .then(items => {
        res.json(items);
      })
      .catch(err => console.log(err));
  });
});

mp.MongoClient.connect(dbstr)
  .then(database => {
    db = database;

    app.listen(PORT, () => {
      console.log(`xkcd-pwa is running on port ${PORT}`);
    });

  });
