const express = require('express');
const path = require('path');
const http = require('http');
const request = require('request');
const mp = require('mongodb-promise');

const app = express();

const PORT = process.env.PORT || 3000;
const XKCD = 'http://xkcd.com/';
const dbstr = 'mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b';

var db;

app.use(express.static('static'))

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
    col.find().sort({
        "num": -1
      }).toArray()
      .then(items => res.json(items));
  });
});

mp.MongoClient.connect(dbstr)
  .then(database => {
    db = database;

    app.listen(PORT, () => {
      console.log(`xkcd-pwa is running on port ${PORT}`);
    });

  });
