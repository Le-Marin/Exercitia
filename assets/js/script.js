(function(view) {
  'use strict';

  const { $, $$, parseNode, loadScript, memoize } = __UTILS;

  const docTitle = document.title;
  const curScript = document.currentScript || [...document.scripts].pop();
  const ver = (curScript.src.match(/\?v=\d+$/) || [''])[0];

  const root = $('#root');
  const rowsCont = parseNode('<div class="rows-container"></div>');

  const checkForm = parseNode(/*html*/`
    <div class="check-form">
      <button class="check-form__button">Проверить</button>
      <span class="check-form__text"></span>
    </div>
  `);

  const rootNodes = [rowsCont, checkForm];

  // ======================

  const keyboard = (function() {
    const defaultKeys = 'ĀĒĪŌŪȲ'.split('');

    const target = parseNode(/*html*/`
      <div class="keyboard">
        <div class="keyboard__switcher"></div>
        <div class="keyboard__body"></div>
      </div>
    `);

    const body = target.lastElementChild;

    function createLine(keys) {
      const items = keys.map(key => `<div class="keyboard__key">${key}</div>`);
      return `<div class="keyboard__line">${items.join('')}</div>`;
    }

    return {
      __init__() {
        rootNodes.push(target);
        this.onHandleClick = this.onHandleClick.bind(this);
        target.addEventListener('click', this.onHandleClick);
      },
      onHandleClick(e) {
        const trg = e.target;

        if (trg.matches('.keyboard__switcher'))
          return this.toggle();

        if (trg.matches('.keyboard__key'))
          return this.printKey(trg.textContent, e.shiftKey);
      },
      toggle() {
        return body.classList.toggle('__shown');
      },
      printKey(key, isUpper) {
        if (!isUpper) key = key.toLowerCase();
        return document.execCommand('insertText', false, key);
      },
      onRootChange({keys = ''}) {
        const lines = keys && keys.split(' | ').map((str) => str.split(' '));
        const html = [defaultKeys, ...lines].map(createLine).join('');
        body.innerHTML = html;
      },
    };
  })();

  keyboard.__init__();

  // ======================

  let tip = { hide: Function.prototype };

  loadScript(`assets/js/tip.js${ver}`).then(() => {
    tip = __TIP;
    tip.__init__(() => rootNodes.push(tip.target));
  });

  // ======================

  const [checkButton, checkTextEl] = checkForm.children;

  checkButton.addEventListener('click', function() {
    const elems = $$('.area[data-key]');

    if (this.__enabled) {
      tip.hide();
      this.__enabled = false;
      checkTextEl.textContent = '';

      return elems.forEach((el) => {
        el.removeAttribute('data-valid');
        el.oninput = el.onfocus = el.onblur = null;
      });
    }

    this.__enabled = true;
    checkTextEl.textContent = ` / ${elems.length}`;

    elems.forEach((el) => {
      setValid(el);
      el.onfocus = onFocus;
    });

    function setValid(el) {
      const key = el.dataset.key.toLowerCase();
      const val = el.textContent.toLowerCase();
      const isValid = key.split(' | ').some(x => x === val);
      el.dataset.valid = +isValid;
      return isValid;
    }

    function onFocus() {
      this.onblur = tip.hide;
      this.oninput = onInput;
      if (!+this.dataset.valid) tip.render(this);
    }

    function onInput() {
      if (setValid(this)) tip.hide();
      else tip.render(this);
    }
  });

  // ======================

  let pageData = {};

  view.onRootChange = function(data) {
    pageData = data;
    document.title = `${docTitle} | ${data.title}`;
    checkTextEl.textContent = '';
    checkButton.__enabled = false;
    document.body.className = data.className;
    rowsCont.innerHTML = data.html;
    keyboard.onRootChange(data);
    tip.hide();
    root.classList.remove('__unavailable');
    root.replaceChildren(...rootNodes);
  };

  view.$_GET = function(data) {
    const s = ' spellcheck="false" contenteditable="true"';
    data.html = data.html.replaceAll(s, '').replaceAll('"area"', '"area"' + s);
    return pageData = data;
  };

  const getContent = memoize(async (url) => {
    const response = await loadScript(url).catch(error => error);
    return (response instanceof Error) ? response : pageData;
  });

  view.onRoute = async function() {
    const url = location.hash.slice(2);
    if (!url) return $_403();

    const response = await getContent(`${url}.js${ver}`);
    if (response instanceof Error) return $_404();

    view.onRootChange(response);
  };

  view.addEventListener('hashchange', () => view.onRoute());

  // ======================

  function $_403() {
    printError(
      '403 Forbidden',
      'You don\'t have permission to access this resource.'
    );
  }

  function $_404() {
    let url = location.pathname + location.hash;
    let ind = url.indexOf('/src/');

    if (~ind) url = url.slice(ind);

    printError('404 Not Found', `Cannot GET <span>${url}</span>`);
  }

  function printError(title, text) {
    document.title = docTitle;
    document.body.className = '';
    root.classList.add('__unavailable');

    root.innerHTML = /*html*/`
      <div class="error">
        <h1>${title}</h1>
        <p>${text}</p>
      </div>
    `;
  }

  // ======================

  if (location.protocol === 'file:') {
    view.__ROOT = { root, rootNodes, get pageData() { return pageData; } };
    loadScript('assets/js/_admin.js');
  } else onRoute();
})(document.defaultView);