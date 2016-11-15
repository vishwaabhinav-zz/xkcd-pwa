#! /usr/bin/env node

'use strict';

const Bottleneck = require("bottleneck");
const request = require('request-promise');
const mp = require('mongodb-promise');

var limiter = new Bottleneck(100000, 10);

const XKCD = 'http://xkcd.com/';
const JSON_URL = 'info.0.json';
var promiseArr = [];
var db;

mp.MongoClient.connect('mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b')
  .then(database => {
    db = database;

    _fetchJSON()
      .then(_getLatest)
      .then(_getAll)
      .then(arr => console.log(arr))
      .catch(err => {
        console.log(data);
        console.error(err.message);
      });
  }).fail(err => console.log(err));

function _checkIfExists(json) {
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
}

function _insert(json) {
  console.log(json.num);
  return db.collection('records')
    .then(col => col.insert(json))
    .then(result => {
      console.log(result);
      db.close()
        .then(console.log('success'));
    });
}

function _getLatest(json) {
  _checkIfExists(json)
    .then(_insert)
    .catch(err => console.log(err.message));

  return json.num;
}

function _createCache(num) {
  return _fetchJSON(num).then(_checkIfExists).then(_insert);
}

function _getAll(latest) {
  for (var i = 1; i < latest; i++) {
    limiter.schedule(_createCache, i)
      .catch(function (err) {
        console.log(`${this} : ${err.message}`);
      }.bind(i));
  }

  return Promise.all(promiseArr);
}

function _fetchJSON(num) {
  var options = {
    url: `${XKCD}/${num || ''}/${JSON_URL}`,
    json: true
  }

  return request(options);
}
