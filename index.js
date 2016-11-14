const express = require('express');
const path = require('path');
const http = require('http');
const request = require('request');
const app = express();

const PORT = process.env.PORT || 3000;
const XKCD = 'http://xkcd.com/';
const dbstr = 'mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b';
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

});

app.listen(PORT, () => {
  console.log(`xkcd-pwa is running on port ${PORT}`);
});
