(function init() {

  var importDoc = document.querySelector('#templates').import;

  function fetchNext() {
    return fetch(`/next`)
      .then(response => response.json())
      .then(json => {
        if (json.length) {
          setTimeout(function () {
            _createPosts(json)
          }, 0);
        }
        return json.length;
      })
      .then(function (len) {
        if (len) {
          fetchNext();
        } else {
          return Promise.reject('End of Story');
        }
      });
  }


  fetchNext()
    .catch(function (err) {
      console.log(err);
    });

  function _createPosts(json) {
    json.forEach(post => {
      let template = importDoc.querySelector('#post-template');
      let clone = document.importNode(template.content, true);

      clone.querySelector('h3 > a').textContent = post.title;
      clone.querySelector('h3 > a').href = '#' + post.num;
      clone.querySelector('h3 > a').id = post.num;
      clone.querySelector('.alt').textContent = post.alt;
      // clone.querySelector('.img').style.background = 'url(' + post.img + ') bottom center no-repeat';
      clone.querySelector('img').src = post.img;

      document.querySelector('.post-container').appendChild(clone);
    });
  }

  function _addEventListeners(len) {
    document.querySelector('.fa-random').addEventListener('click', function _goToRandom(e) {
      var rand = Math.floor(Math.random() * len);
      document.getElementById(rand).scrollIntoView({
        'behavior': 'smooth'
      });
      window.scrollBy(0, -50);
    });
  }
})();
