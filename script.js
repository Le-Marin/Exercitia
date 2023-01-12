(function() {
  'use strict';

  if (location.protocol !== 'file:') return;

  loadScript('_edit.js');

  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
    script.remove();
  }
})();