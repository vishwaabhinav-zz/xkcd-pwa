/*global firebase*/
'use strict';
require('whatwg-fetch');
require('../css/master.css');
require('../views/templates.html');

window.onload = function init() {

  //Init firebase
  var config = {
    apiKey: "AIzaSyAaiLZt8QjllRnNwXTTExlkSjzULTmDK7Y",
    messagingSenderId: "574431562885"
  };
  firebase.initializeApp(config);
  var messaging = firebase.messaging();

  messaging.onMessage(function(payload) {
    console.log(payload);
  });

  messaging.onTokenRefresh(function() {
    messaging.getToken()
      .then(function(refreshedToken) {
        console.log('Token refreshed.');
        _registerDeviceForMessaging(refreshedToken);
      // ...
      })
      .catch(function(err) {
        console.log('Unable to retrieve refreshed token ', err);
      // showToken('Unable to retrieve refreshed token ', err);
      });
  });

  // var importDoc = document.querySelector('#templates').import;
  var length = 0;
  var current = -1;

  function fetchNext() {
    if (current > -2) {
      return fetch('/next?current=' + current)
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          if (json.length) {
            setTimeout(function() {
              _createPosts(json)
            }, 0);
            length = length < json[0].num ? json[0].num : length;
            current = json[json.length - 1].num;
          }
          return json.length;
        })
        .then(function(len) {
          if (!len) {
            current = -2;
            console.log('End of Story');
          } else {
            // fetchNext();
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  }

  function _createPosts(json) {
    json.forEach(function(post) {
      var template = document.querySelector('#post-template');
      var clone = document.importNode(template.content, true);

      var imgSrc = 'https:' + post.img.split(':')[1];

      clone.querySelector('h3 > a').textContent = post.title;
      clone.querySelector('h3 > a').href = '#' + post.num;
      clone.querySelector('h3 > a').id = post.num;
      clone.querySelector('.alt').textContent = post.alt;
      // clone.querySelector('.img').style.background = 'url(' + post.img + ') bottom center no-repeat';
      clone.querySelector('img').onload = function showPost() {
        this.closest('.post-wrapper').style.display = '';
      };
      clone.querySelector('img').src = imgSrc;
      clone.querySelector('img').setAttribute('alt', post.alt);

      document.querySelector('.post-container').appendChild(clone);
    });
  }

  var flag;

  function throttle(func) {
    return function scrollListener() {
      if (!flag) {
        flag = true;
        setTimeout(function() {
          func();
          flag = false;
        }, 500);
      }
    }
  }

  function _addEventListeners() {
    document.querySelector('.goto-top > img').addEventListener('click', function _goToTop(e) {
      scrollTo(0, 0);
    });

    document.querySelector('.banner > img').addEventListener('click', function _goToRandom(e) {
      do {
        var rand = Math.floor(Math.random() * length);
        var post = document.getElementById(rand);
        if (post && post.closest('.post-wrapper').style.display !== 'none') {
          post.scrollIntoView({
            'behavior': 'smooth'
          });
          window.scrollBy(0, -50);
          return;
        }
      } while (true);
    });

    document.addEventListener('scroll', throttle(fetchNext));
  }

  function _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service_worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);

        if (_pushEnabled()) {
          document.addEventListener('scroll', _checkForPushSubscription);
          document.addEventListener('touchstart', _checkForPushSubscription);
        }
      }).catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function _pushEnabled() {
    return ('PushManager' in window);
  }

  function _checkForPushSubscription() {
    messaging.requestPermission()
      .then(function() {
        console.log('Notification permission granted.');
        return messaging.getToken();
      })
      .then(function(token) {
        _registerDeviceForMessaging(token);
        console.log(token);
      })
      .catch(function(err) {
        console.log('Unable to get permission to notify.', err);
      });
    document.removeEventListener('scroll', _checkForPushSubscription);
    document.removeEventListener('touchstart', _checkForPushSubscription);
  }

  function _registerDeviceForMessaging(token) {
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token
      })
    }).then(function(response) {
      console.log(response);
    }).catch(function(err) {
      console.log(err);
    });
  }

  fetchNext();
  _addEventListeners();
  _registerServiceWorker();
};