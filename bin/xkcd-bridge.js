#! /usr/bin/env node

'use strict';

const request = require('request-promise');
const mongo = require('mongodb').MongoClient;
const sizeOf = require('imagesize');
const https = require('https');

const XKCD = 'http://xkcd.com/';
const JSON_URL = 'info.0.json';
const connStr = 'mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/heroku_97mjvv9b';

var db,
  collection;

function _fetchJSON() {
  var options = {
    url: `${XKCD}/${JSON_URL}`,
    json: true
  }

  return request(options);
}

function _notify(title) {
  var options = {
    method: 'POST',
    url: 'https://xkcd-pwa.herokuapp.com/notify',
    body: {
      title: title
    },
    json: true
  }

  return request(options);
}

function _checkIfUpdated(json) {
  console.log(json);
  return new Promise((resolve, reject) => {
    collection.find({
      'num': json.num
    }).toArray((err, items) => {
      if (err) {
        reject(err);
      }
      if (items.length) {
        return reject('already exists');
      } else {
        return resolve(json);
      }
    });
  });
}

function _insert(json) {
  return new Promise((resolve, reject) => {
    if (!json.img) {
      reject('Image not present');
    }

    https.get(json.img, (response) => {
      if (response.statusCode !== 200) {
        reject(`invalid status code ${response.statusCode}`);
      }
      response.on('error', err => {
        reject(`http error ${err}`);
      });

      sizeOf(response, (err, result) => {
        if (err) {
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

          resolve(_notify(json.title));
        });
      });
    }).on('error', err => reject(err));
  })
}

mongo.connect(connStr, (err, database) => {
  if (!err) {
    db = database;
    collection = db.collection('records');

    _fetchJSON()
      .then(_checkIfUpdated)
      .then(_insert)
      .then(() => {
        db.close();
      })
      .catch(err => {
        console.log(err);
        db.close();
      });
  }
});
