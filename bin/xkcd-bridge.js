#! /usr/bin/env node

const Bottleneck = require("bottleneck");
const request = require('request-promise');
// const request = limiter(require('request-promise')).to(2).per(1000);

var limiter = new Bottleneck(1000, 10);

const XKCD = 'http://xkcd.com/';
const JSON_URL = 'info.0.json';
var data = {};
var promiseArr = [];

function _getLatest(json) {
  // console.log(json);
  data[json.num] = json;
  return json.num;
}

function _createCache(num) {
  let promise = _fetchJSON(num)
    .then(json => {
      // console.log(json);
      data[json.num] = json;
    });
  promiseArr.push(promise);
  return promise;
}

function _getAll(latest) {
  for (var i = 1; i < latest; i++) {
    limiter.schedule(_createCache, i)
      .catch(err => {
        console.log(err);
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
    console.error(err);
  });

module.exports = function _getXKCD() {
  return data;
};
