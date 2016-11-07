(function init() {
  const XKCD = 'http://xkcd.com/';
  fetch(`${XKCD}info.0.json`, {
      credentials: 'include',
      mode: 'no-cors'
    })
    .then(response => response.json())
    .then(json => console.log(json));
})();
