/* Offline, dependency-free slide navigation. Original PNGs are never modified. */
(() => {
  'use strict';
  const stage = document.querySelector('#stage');
  const slides = [...document.querySelectorAll('.slide')];
  const toc = document.querySelector('#toc');
  const viewer = document.querySelector('#figure-viewer');
  const search = document.querySelector('#search');
  let current = 0;
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const resize = () => {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `scale(${scale})`;
    stage.style.left = `${(innerWidth - 1920 * scale) / 2}px`;
    stage.style.top = `${(innerHeight - 1080 * scale) / 2}px`;
  };
  function goTo(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      const img = slide.querySelector('.map-figure img');
      if (img) {
        if (Math.abs(i - current) <= 1) { if (!img.getAttribute('src')) img.src = img.dataset.src; }
        else img.removeAttribute('src');
      }
    });
    document.querySelector('#counter').textContent = `${current + 1} / ${slides.length}`;
    document.querySelector('#previous').disabled = current === 0;
    document.querySelector('#next').disabled = current === slides.length - 1;
    document.title = `${current + 1} / ${slides.length} · ${slides[current].getAttribute('aria-label').replace(/^\d+\. /, '')} · Peru 2025`;
    if (updateHash) history.replaceState(null, '', `#${slides[current].id}`);
  }
  function fromHash() {
    const id = location.hash.slice(1);
    const i = slides.findIndex(s => s.id === id);
    goTo(i < 0 ? 0 : i, false);
  }
  async function ready() {
    await document.fonts.ready;
    const img = slides[current].querySelector('.map-figure img');
    if (img) await img.decode();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  }
  function openContents() {
    search.value = '';
    filter();
    toc.showModal();
    search.focus();
  }
  function filter() {
    const q = normalize(search.value);
    document.querySelectorAll('.toc-item').forEach(item => item.hidden = !normalize(item.dataset.search).includes(q));
  }
  async function fullScreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      document.querySelector('#fullscreen').title = 'Full screen unavailable here; use your browser full-screen command.';
    }
  }
  function enlarge() {
    const img = slides[current].querySelector('.map-figure img');
    if (!img) return;
    const target = document.querySelector('#viewer-image');
    target.src = img.dataset.src;
    target.alt = img.alt;
    document.querySelector('#original-link').href = img.dataset.src;
    document.querySelector('#figure-label').textContent = slides[current].getAttribute('aria-label');
    viewer.showModal();
  }
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-go]');
    if (link) {
      e.preventDefault();
      const index = slides.findIndex(s => s.id === link.dataset.go);
      if (index >= 0) { if (toc.open) toc.close(); goTo(index); }
    }
    const close = e.target.closest('[data-close]');
    if (close) document.getElementById(close.dataset.close).close();
    if (e.target.closest('.expand-map')) enlarge();
  });
  document.querySelector('#previous').onclick = () => goTo(current - 1);
  document.querySelector('#next').onclick = () => goTo(current + 1);
  document.querySelector('#contents').onclick = openContents;
  document.querySelector('#fullscreen').onclick = fullScreen;
  search.addEventListener('input', filter);
  document.addEventListener('keydown', e => {
    if (toc.open || viewer.open || e.ctrlKey || e.altKey || e.metaKey || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const actions = {
      ArrowRight: () => goTo(current + 1), ArrowDown: () => goTo(current + 1),
      PageDown: () => goTo(current + 1), ' ': () => goTo(current + 1),
      ArrowLeft: () => goTo(current - 1), ArrowUp: () => goTo(current - 1),
      PageUp: () => goTo(current - 1), Home: () => goTo(0), End: () => goTo(slides.length - 1),
      t: openContents, T: openContents, f: fullScreen, F: fullScreen
    };
    if (actions[e.key]) { e.preventDefault(); actions[e.key](); }
  });
  addEventListener('resize', resize);
  addEventListener('hashchange', fromHash);
  viewer.addEventListener('close', () => document.querySelector('#viewer-image').removeAttribute('src'));
  window.atlas = {goTo, ready, get index() {return current;}, get count() {return slides.length;}};
  resize(); fromHash();
})();
