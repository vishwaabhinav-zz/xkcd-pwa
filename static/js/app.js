(function init() {
  fetch(`/all`)
    .then(response => response.json())
    .then(json => {
      _createPosts(json);
      _addEventListeners(json.length);
    });

  var importDoc = document.querySelector('#templates').import;

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
