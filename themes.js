(() => {
  'use strict';
  const themes = [
    ['moonlight', 'Moonlight', '#48405f'],
    ['rose', 'Rose garden', '#bf647c'],
    ['lavender', 'Lavender dreams', '#9680c8'],
    ['forest', 'Enchanted forest', '#558d70']
  ];
  const root = document.documentElement;
  let saved;
  try { saved = localStorage.getItem('birthday-theme'); } catch {}
  root.dataset.theme = themes.some(([id]) => id === saved) ? saved : 'moonlight';
  const tools = document.createElement('div');
  tools.className = 'magic-tools';
  tools.innerHTML = `<button type="button" id="themeToggle" aria-expanded="false" aria-controls="themePanel">Choose your mood ♡</button><button type="button" id="giftToggle">A little gift ✧</button>`;
  const panel = document.createElement('section');
  panel.id = 'themePanel';
  panel.className = 'theme-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Choose your theme');
  panel.innerHTML = `<p>Your world, your mood.</p><div class="theme-options">${themes.map(([id, name, color]) => `<button type="button" class="theme-option" data-choice="${id}" aria-pressed="${root.dataset.theme === id}"><span class="theme-swatch" style="--swatch:${color}" aria-hidden="true"></span>${name}</button>`).join('')}</div><small>A little change of scenery. Your favourite stays saved on this browser.</small>`;
  const dialog = document.createElement('dialog');
  dialog.className = 'gift-dialog';
  dialog.setAttribute('aria-labelledby', 'giftTitle');
  dialog.innerHTML = `<button type="button" class="gift-close" aria-label="Close gift">×</button><div class="gift-symbol" aria-hidden="true">♡</div><h2 id="giftTitle">A pocketful of love.</h2><p id="giftCaption">Tiny surprises, wrapped just for you.</p><p class="gift-note" id="giftNote" aria-live="polite"></p><button type="button" class="small-button" id="nextGift">Unwrap a little note ✧</button><p id="giftCount"></p>`;
  const moon = document.createElement('button');
  moon.type = 'button';
  moon.className = 'moon-secret';
  moon.setAttribute('aria-label', 'Discover a secret from the moon');
  moon.title = 'The moon has a little secret…';
  document.body.append(tools, panel, dialog, moon);
  const toggle = document.getElementById('themeToggle');
  const closePanel = () => { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  });
  panel.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]');
    if (!choice) return;
    root.dataset.theme = choice.dataset.choice;
    try { localStorage.setItem('birthday-theme', choice.dataset.choice); } catch {}
    panel.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--world-bg').trim();
  });
  document.addEventListener('click', event => { if (!panel.contains(event.target) && !toggle.contains(event.target)) closePanel(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { closePanel(); toggle.focus(); } });
  const notes = [
    'Tumhari smile meri favourite notification hai. Har baar, dil khush ho jaata hai. ♡',
    'One imaginary coupon: a long hug, a forehead kiss, and all my attention. Redeem whenever you like.',
    'Agar aaj ka din thoda heavy lage, yaad rakhna: tum bahut pyaari ho, aur bahut loved bhi.',
    'My birthday wish for you? More peaceful mornings, more silly laughter, and all the love your heart can hold.',
    'Har theme badal sakti hai. Meri favourite person? Hamesha tum. ♡'
  ];
  let next = 0;
  const note = document.getElementById('giftNote');
  const nextButton = document.getElementById('nextGift');
  function unwrap() {
    note.textContent = notes[next];
    document.getElementById('giftCount').textContent = `${next + 1} / ${notes.length} little notes`;
    next = (next + 1) % notes.length;
    nextButton.textContent = next === 0 ? 'Read them again ♡' : 'One more little note ✧';
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) note.animate([{ opacity:0, transform:'translateY(8px)' }, { opacity:1, transform:'translateY(0)' }], { duration:350 });
  }
  document.getElementById('giftToggle').addEventListener('click', () => {
    closePanel();
    document.getElementById('giftTitle').textContent = 'A pocketful of love.';
    document.getElementById('giftCaption').textContent = 'Tiny surprises, wrapped just for you.';
    if (!dialog.open) dialog.showModal();
    unwrap();
  });
  nextButton.addEventListener('click', unwrap);
  dialog.querySelector('.gift-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  moon.addEventListener('click', () => {
    closePanel();
    document.getElementById('giftTitle').textContent = 'You found my little secret.';
    document.getElementById('giftCaption').textContent = 'Even the moon knows…';
    note.textContent = 'Itne saare taaron ke beech bhi, meri nazar sirf tumhe dhoondhti hai. You are my favourite kind of magic. ♡';
    document.getElementById('giftCount').textContent = 'A secret, just between us and the moon.';
    nextButton.textContent = 'Open a love note ♡';
    if (!dialog.open) dialog.showModal();
  });
})();
