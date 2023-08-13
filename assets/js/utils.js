const __UTILS = (function() {
  'use strict';

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

  function parseNode(html, callback) {
    let elem = document.createElement('div');
    elem.innerHTML = html;
    elem = elem.firstElementChild.cloneNode(true);
    callback && callback.call(elem, elem);
    return elem;
  }

  function memoize(fn) {
    const cache = new Map();
    return (x) => cache.get(x) || cache.set(x, fn(x)).get(x);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(null));
      document.head.appendChild(script);
      script.remove();
    });
  }

  return {
    $, $$,
    memoize,
    parseNode,
    loadScript,
  };
})();