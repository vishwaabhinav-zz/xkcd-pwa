const express = require('express');
const path = require('path');
const http = require('http');
const request = require('request');
const app = express();

const XKCD = 'http://xkcd.com/';

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

app.listen(3000);
