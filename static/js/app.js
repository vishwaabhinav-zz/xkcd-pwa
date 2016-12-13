'use strict';

window.onload = function init() {

  // //Init firebase
  // var config = {
  //   apiKey: "AIzaSyAaiLZt8QjllRnNwXTTExlkSjzULTmDK7Y",
  //   messagingSenderId: "574431562885"
  // };
  // firebase.initializeApp(config);

  var applicationServerPublicKey = 'BOQMzL5OX41xCo43Qs9yPEhJOOZQKCMLOfXc4x3PL6ctxoKt7OxWF4NoQAHeofMbw9jVmZ5Fy9iUgvy-1d7AP04';

  var importDoc = document.querySelector('#templates').import;
  var length = 0;
  var current = -1;
  var swRegistration = null;
  var isSubscribed = false;

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

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

      let imgSrc = 'https:' + post.img.split(':')[1];

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

  function _subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    }).then(function (subscription) {
      console.log('User is subscribed:', subscription);

      // updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      // updateBtn();
    }).catch(function (err) {
      console.log('Failed to subscribe the user: ', err);
      // updateBtn();
    });
  }

  function _checkForPushSubscription() {
    swRegistration.pushManager.getSubscription()
      .then(function (subscription) {
        isSubscribed = !(subscription === null);

        if (isSubscribed) {
          console.log('User IS subscribed.');
        } else {
          console.log('User is NOT subscribed.');
          _subscribeUser();
        }
      });
  }

  fetchNext();
  _addEventListeners();
  _registerServiceWorker();
};