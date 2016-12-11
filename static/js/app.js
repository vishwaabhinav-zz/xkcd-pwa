'use strict';

window.onload = function init() {
  var importDoc = document.querySelector('#templates').import;
  var length = 0;
  var current = -1;
  var swRegistration = null;
  var isSubscribed = false;

  function fetchNext() {
    return fetch('/next?current=' + current)
      .then(response => response.json())
      .then(json => {
        if (json.length) {
          setTimeout(function () {
            _createPosts(json)
          }, 0);
          length = length < json[0].num ? json[0].num : length;
          current = json[json.length - 1].num;
        }
        return json.length;
      })
      .then(function (len) {
        if (!len) {
          console.log('End of Story');
        } else {
          fetchNext();
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function _createPosts(json) {
    json.forEach(post => {
      let template = importDoc.querySelector('#post-template');
      let clone = document.importNode(template.content, true);

      imgSrc = 'https:' + post.img.split(':')[1];

      clone.querySelector('h3 > a').textContent = post.title;
      clone.querySelector('h3 > a').href = '#' + post.num;
      clone.querySelector('h3 > a').id = post.num;
      clone.querySelector('.alt').textContent = post.alt;
      // clone.querySelector('.img').style.background = 'url(' + post.img + ') bottom center no-repeat';
      clone.querySelector('img').onload = function showPost() {
        this.closest('.post-wrapper').style.display = '';
      };
      clone.querySelector('img').src = imgSrc;

      document.querySelector('.post-container').appendChild(clone);
    });
  }

  function _addEventListeners() {
    document.querySelector('.fa-toggle-up').addEventListener('click', function _goToTop(e) {
      scrollTo(0, 0);
    });

    document.querySelector('.fa-random').addEventListener('click', function _goToRandom(e) {
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
  }

  function _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service_worker.js').then(function (registration) {
        swRegistration = registration;
        console.log('ServiceWorker registration successful with scope: ', registration.scope);

        if (_pushEnabled()) {
          _checkForPushSubscription();
        }
      }).catch(function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function _pushEnabled() {
    return ('PushManager' in window);
  }

  function _checkForPushSubscription() {
    swRegistration.pushManager.getSubscription()
      .then(function (subscription) {
        isSubscribed = !(subscription === null);

        if (isSubscribed) {
          console.log('User IS subscribed.');
        } else {
          console.log('User is NOT subscribed.');
        }
      });
  }

  fetchNext();
  _addEventListeners();
  _registerServiceWorker();
};