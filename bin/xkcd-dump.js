#! /usr/bin/env node

'use strict';

const Bottleneck = require("bottleneck");
const request = require('request-promise');
const mp = require('mongodb-promise');

var limiter = new Bottleneck(1000, 5);

const XKCD = 'http://xkcd.com/';
const JSON_URL = 'info.0.json';
var data = {};
var promiseArr = [];

function _insert(json) {
  mp.MongoClient.connect('mongodb://heroku_97mjvv9b:aVishwa1@ds145997.mlab.com:45997/heroku_97mjvv9b')
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

function _getLatest(json) {
  _insert(json);
  return json.num;
}

function _createCache(num) {
  let promise = _fetchJSON(num)
    .then(json => {
      _insert(json);
    });
  promiseArr.push(promise);
  return promise;
}

function _getAll(latest) {
  for (var i = 1; i < latest; i++) {
    limiter.schedule(_createCache, i)
      .catch(err => {
        console.log(err.message);
      });
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

_fetchJSON()
  .then(_getLatest)
  .then(_getAll)
  .then(arr => console.log(arr))
  .catch(err => {
    console.log(data);
    console.error(err.message);
  });
