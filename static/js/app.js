(function init() {
  fetch(`/all`)
    .then(response => response.json())
    .then(json => {
      _createPosts(json);
    });

  var importDoc = document.querySelector('#templates').import;

  function _createPosts(json) {
    json.forEach(post => {
      let template = importDoc.querySelector('#post-template');
      let clone = document.importNode(template.content, true);

      clone.querySelector('h3').textContent = post.title;
      clone.querySelector('.alt').textContent = post.alt;
      // clone.querySelector('.img').style.background = 'url(' + post.img + ') bottom center no-repeat';
      clone.querySelector('img').src = post.img;

      document.querySelector('.post-container').appendChild(clone);
    });
  }
})();
