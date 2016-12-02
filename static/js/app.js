(function init() {

  var importDoc = document.querySelector('#templates').import;
  var length = 0;
  var timeout = null;
  var current = -1;

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
          // console.log('End of Story');
          // document.removeEventListener('scroll', fetchNext);
          // clearInterval(timeout);
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
      clone.querySelector('img').src = imgSrc;

      document.querySelector('.post-container').appendChild(clone);
    });
  }

  function _addEventListeners() {
    // timeout = setInterval(fetchNext, 100);

    document.querySelector('.fa-random').addEventListener('click', function _goToRandom(e) {
      var rand = Math.floor(Math.random() * length);
      document.getElementById(rand).scrollIntoView({
        'behavior': 'smooth'
      });
      window.scrollBy(0, -50);
    });
  }

  function _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service_worker.js').then(function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  fetchNext();
  _addEventListeners();
  _registerServiceWorker();
})();
