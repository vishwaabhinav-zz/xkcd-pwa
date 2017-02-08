#! /usr/bin/env node

'use strict';

const Bottleneck = require("bottleneck");
const request = require('request-promise');
const mongo = require('mongodb').MongoClient;
const sizeOf = require('imagesize');
const https = require('https');

var limiter = new Bottleneck(1000, 15);

const XKCD = 'http://xkcd.com/';
const JSON_URL = 'info.0.json';
var db,
  collection;

mongo.connect('mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b',
  (err, database) => {
    if (err) {
      console.error(err);
    }
    db = database;
    collection = db.collection('records');

    _fetchJSON()
      .then(_getLatest)
      .then(_getAll)
      .then(arr => console.log(arr))
      .catch(err => {
        console.error(err.message);
      });
  });

function _insert(json) {
  // console.log(json.num);
  return new Promise((resolve, reject) => {
    if (!json.img) {
      reject('Image not present');
    }
    https.get(json.img, (response) => {
      if (response.statusCode !== 200) {
        console.log(`status code: ${response.statusCode}`);
        reject(`invalid status code ${response.statusCode}`);
      }
      response.on('error', err => {
        console.log('http error', err);
        reject(`http error ${err}`);
      });

      sizeOf(response, (err, result) => {
        if (err) {
          console.log('sizeOf', err);
          reject(err);
        }
        json.height = (result && result.height) || 0;
        json.width = (result && result.width) || 0;

        collection.update({
          'num': json.num
        }, json, {
          upsert: true
        }, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
    }).on('error', err => reject(err));

  });
}

function _getLatest(json) {
  _insert(json)
    .catch(err => console.log(err.message));

  return json.num;
}

function _createCache(num) {
  return _fetchJSON(num).then(_insert);
}

function _getAll(latest) {
  for (var i = 1; i < latest; i++) {
    limiter.schedule(_createCache, i)
      .catch(function(err) {
        console.log(`${this} : ${err.message}`);
      }.bind(i));
  }

  // limiter.on('empty', () => {
  //   db.close();
  // });

}

function _fetchJSON(num) {
  var options = {
    url: `${XKCD}/${num || ''}/${JSON_URL}`,
    json: true
  }

  return request(options);
}
