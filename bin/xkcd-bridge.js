#! /usr/bin/env node

'use strict';

const request = require('request-promise');
const mp = require('mongodb-promise');

const XKCD = 'http://xkcd.com/';
const JSON_URL = 'info.0.json';

function _fetchJSON() {
  var options = {
    url: `${XKCD}/${JSON_URL}`,
    json: true
  }

  return request(options);
}

function _checkIfUpdated(json) {
  console.log(json);
  return mp.MongoClient.connect('mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b')
    .then(db => {
      return db.collection('records')
        .then(col => col.find({
          'num': json.num
        }).toArray())
        .then(items => {
          if (items.length) {
            return Promise.reject('already exists');
          } else {
            return Promise.resolve(json);
          }
        });
    });
}

function _insert(json) {
  mp.MongoClient.connect('mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b')
    .then(db => {
      return db.collection('records')
        .then(col => col.insert(json))
        .then(result => {
          console.log(result);
          db.close()
            .then(console.log('success'));
        });
    })
    .fail(err => console.log(err));
}

_fetchJSON()
  .then(_checkIfUpdated)
  .then(_insert)
  .catch(err => console.log(err));
