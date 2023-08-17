const __TIP = ((elem) => {
  'use strict';

  const setCSS = elem.style.setProperty.bind(elem.style);
  const getClientWidth = () => document.documentElement.clientWidth;

  function onTipFocus(e) {
    const trg = e.target;
    if (trg.matches('.area[data-valid="0"]')) this.render(trg);
    else this.hide();
  }

  return {
    __init__(onInit) {
      elem.id = 'tip';
      this.hide = this.hide.bind(this);
      onTipFocus = onTipFocus.bind(this);
      document.addEventListener('mouseover', onTipFocus);
      onInit.call(this);
    },
    get target() {
      return elem;
    },
    get hidden() {
      return !elem.offsetWidth;
    },
    move({left, top, right, height}) {
      const offset = 4;
      const w = elem.offsetWidth;
      const h = elem.offsetHeight + offset;
      const x = right + w + offset >= getClientWidth()
        ? Math.max(2, left - w - offset)
        : right + offset;
      const y = top + (height - h) / 2;
      setCSS('--x', `${~~x}px`);
      setCSS('--y', `${y + window.scrollY >> 0}px`);
    },
    render(trg) {
      elem.textContent = trg.dataset.key;
      this.move(trg.getBoundingClientRect());
    },
    hide() {
      if (this.hidden) return;
      elem.textContent = '';
    }
  };
})(document.createElement('div'));