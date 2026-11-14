(() => {
  'use strict';
  const worlds = [
    { id: 'moonlight', name: 'Moonlit garden', line: 'Where it all began.', caption: 'a garden of little wishes', symbol: '❀', object: 'A tiny folded letter', title: 'A letter among the flowers.', note: 'Tumhari smile meri favourite notification hai. Har baar, dil khush ho jaata hai. Some flowers bloom only for you. ♡' },
    { id: 'mountains', name: 'Mountain reverie', line: 'Just us, above the noise.', caption: 'somewhere quiet, with you', symbol: '☾', object: 'A little lantern by the lake', title: 'Meet me where the world is quiet.', note: 'Ek chhota sa cabin, mountains, thandi hawa, aur tumhara haath mere haath mein. Someday, a little escape with my favourite person. Just us. ♡' },
    { id: 'forest', name: 'Firefly forest', line: 'A little lost. A little in love.', caption: 'follow the softer kind of light', symbol: '✧', object: 'A wandering golden firefly', title: 'You caught a little light.', note: 'Jab bhi duniya thodi overwhelming lage, mere paas aa jaana. Tumhe kuch kehna bhi nahi padega. A long hug, a forehead kiss, and a little quiet. Always yours. ♡' },
    { id: 'space', name: 'Our little universe', line: 'Every orbit leads to you.', caption: 'in every universe, always you', symbol: '✦', object: 'A small rose-coloured star', title: 'Of all the stars. Still you.', note: 'Itne saare taaron ke beech bhi, meri nazar sirf tumhe dhoondhti hai. In every lifetime, every galaxy, every version of this little universe — I would find you. ♡' }
  ];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const readStored = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const writeStored = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let initial = readStored('birthday-theme');
  if (initial === 'lavender') initial = 'space';
  const found = new Set();
  try {
    const stored = JSON.parse(readStored('birthday-discoveries-v2'));
    if (Array.isArray(stored)) stored.forEach(id => { if (worlds.some(world => world.id === id)) found.add(id); });
  } catch {}
  let active;
  let returnFocus;
  let finalLetter = false;

  const scenery = document.createElement('div');
  scenery.className = 'world-backdrop';
  scenery.setAttribute('aria-hidden', 'true');
  scenery.innerHTML = worlds.filter(world => world.id !== 'moonlight').map(world => `<div class="world-layer" data-landscape="${world.id}"></div>`).join('') + '<div class="world-haze"></div><div class="world-atmosphere">' + Array.from({ length: 14 }, (_, i) => `<i style="--n:${i};--x:${(i * 29 + 11) % 98}%;--y:${(i * 17 + 21) % 80}%"></i>`).join('') + '</div>';

  const tools = document.createElement('div');
  tools.className = 'magic-tools';
  tools.innerHTML = '<button type="button" id="themeToggle" aria-expanded="false" aria-controls="themePanel"><span class="mood-orbit" aria-hidden="true">◌</span><span>Choose your mood</span><span class="mood-chevron" aria-hidden="true">⌄</span></button>';
  const panel = document.createElement('section');
  panel.id = 'themePanel';
  panel.className = 'theme-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Choose your world');
  panel.innerHTML = `<div class="mood-heading"><span>A CHANGE OF SCENERY</span><p>Where shall we go, my love?</p></div><div class="theme-options">${worlds.map(world => `<button type="button" class="theme-option" data-choice="${world.id}" aria-pressed="false"><span class="theme-preview preview-${world.id}" aria-hidden="true">${world.id === 'moonlight' ? '☾' : ''}</span><span class="theme-option-copy"><strong>${world.name}</strong><small>${world.line}</small></span><span class="theme-selected" aria-hidden="true">♡</span></button>`).join('')}</div><p class="world-invitation">Take your time here.<br>Some beautiful things like to be found.</p>`;

  const keepsakes = document.createElement('div');
  keepsakes.className = 'world-keepsakes';
  // Describe scenery objects accessibly without revealing their rewards.
  const drawings = {
    moonlight: '<svg viewBox="0 0 60 60" aria-hidden="true"><g transform="rotate(-14 30 30)"><rect x="13" y="21" width="34" height="24" rx="2" fill="#e0c9b1"/><path d="m14 22 16 13 16-13M14 44l12-11m20 11L34 33" fill="none" stroke="#9b7580" stroke-width="1"/><circle cx="30" cy="33" r="4" fill="#aa6b7e"/><path d="m28 33 2 2 2-2" fill="none" stroke="#f6d8cc"/></g></svg>',
    mountains: '<svg viewBox="0 0 60 72" aria-hidden="true"><ellipse cx="30" cy="49" rx="23" ry="20" fill="#e7b46b" opacity=".08"/><path d="M24 21v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#bfa385" stroke-width="2"/><path d="m21 27 3-7h12l3 7 3 29H18Z" fill="#30252a" stroke="#af9173" stroke-width="1.5"/><path d="M23 30h14l2 22H21Z" fill="#efb96b" fill-opacity=".55"/><path d="M30 30v22M18 57h24M21 26h18" stroke="#c3a17c" stroke-width="2"/><path d="M30 47q-7-5 0-12 6 7 0 12" fill="#ffe7b3"/></svg>',
    forest: '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="33" r="23" fill="#e1e6a0" opacity=".07"/><path d="M29 30C11 10 8 30 27 33M31 30C49 10 52 30 33 33" fill="#dce4b6" opacity=".45"/><ellipse cx="30" cy="34" rx="4" ry="7" fill="#e5e9ab"/><circle cx="30" cy="27" r="3" fill="#879b6e"/></svg>',
    space: '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="24" fill="#edbad5" opacity=".04"/><path d="m30 10 4 15 14 5-14 4-4 16-4-16-14-4 14-5Z" fill="#ecc5d8"/><path d="m30 21 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" fill="#fff0e3"/></svg>'
  };
  keepsakes.innerHTML = worlds.map(world => `<button type="button" class="scenery-object object-${world.id}" data-keepsake="${world.id}" aria-label="${world.object}" hidden>${drawings[world.id]}</button>`).join('');
  const collection = document.createElement('button');
  collection.type = 'button';
  collection.className = 'discovery-collection';
  collection.hidden = true;
  collection.setAttribute('aria-label', 'Open your collection of little discoveries');
  const dialog = document.createElement('dialog');
  dialog.className = 'gift-dialog';
  dialog.setAttribute('aria-labelledby', 'giftTitle');
  dialog.innerHTML = '<button type="button" class="gift-close" aria-label="Close letter">×</button><p class="discovery-eyebrow" id="giftCaption"></p><div class="gift-symbol" id="giftSymbol" aria-hidden="true">♡</div><h2 id="giftTitle"></h2><p class="gift-note" id="giftNote"></p><div class="discovery-constellation" id="discoveryConstellation" aria-label="Your discoveries"></div><p class="discovery-afterword" id="giftCount" aria-live="polite"></p><button type="button" class="small-button" id="keepMoment">Keep this little moment ♡</button>';
  const announcement = document.createElement('span');
  announcement.className = 'world-announcement';
  announcement.setAttribute('role', 'status');
  document.body.prepend(scenery);
  document.body.append(tools, panel, keepsakes, collection, dialog, announcement);

  const toggle = document.getElementById('themeToggle');
  const closePanel = (focus = false) => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (focus) toggle.focus();
  };
  function applyWorld(id, announce = false) {
    active = worlds.find(world => world.id === id) || worlds[0];
    root.dataset.theme = active.id;
    panel.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === active.id)));
    keepsakes.querySelectorAll('[data-keepsake]').forEach(button => { button.hidden = button.dataset.keepsake !== active.id; });
    toggle.setAttribute('aria-label', `Choose your mood. Current world: ${active.name}`);
    document.querySelector('.portal-caption').textContent = active.caption;
    const descriptions = {
      moonlight: 'A whole little world, made for my favourite person.<br>Come in, my love. Everything here blooms for you.',
      mountains: 'A quieter little world, made for my favourite person.<br>Just you, me, and a thousand skies to get lost in.',
      forest: 'A secret little clearing, made for my favourite person.<br>Take my hand. Even the fireflies are here for you.',
      space: 'A whole little universe, made for my favourite person.<br>Among a billion stars, you are still my favourite.'
    };
    document.querySelector('.entry-description').innerHTML = descriptions[active.id];
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--world-bg').trim();
    if (announce) announcement.textContent = `${active.name}. ${active.line}`;
  }
  function updateCollection() {
    collection.hidden = found.size === 0;
    collection.innerHTML = `<span aria-hidden="true">✧</span> ${String(found.size).padStart(2, '0')} / 04 <span class="collection-label">little wonders</span>`;
    keepsakes.querySelectorAll('[data-keepsake]').forEach(button => {
      const isFound = found.has(button.dataset.keepsake);
      button.classList.toggle('is-found', isFound);
      const world = worlds.find(world => world.id === button.dataset.keepsake);
      button.setAttribute('aria-label', `${world.object}${isFound ? ', found. Read again' : ''}`);
    });
    document.getElementById('discoveryConstellation').innerHTML = worlds.map(world => `<span class="${found.has(world.id) ? 'is-collected' : ''}" aria-label="${found.has(world.id) ? world.name + ', discovered' : 'An undiscovered little wonder'}">${found.has(world.id) ? world.symbol : '·'}</span>`).join('<i aria-hidden="true"></i>');
  }
  function openLetter(world, isNew = false, showFinal = false) {
    if (!dialog.open) returnFocus = document.activeElement;
    closePanel();
    finalLetter = showFinal;
    dialog.classList.toggle('is-complete', showFinal);
    document.getElementById('giftCaption').textContent = showFinal ? 'YOU FOUND EVERY LITTLE PIECE OF MY HEART' : isNew ? 'SOMETHING BEAUTIFUL FOUND YOU, TOO' : 'A LITTLE MOMENT, KEPT SAFE';
    document.getElementById('giftSymbol').textContent = showFinal ? '♡' : world.symbol;
    document.getElementById('giftTitle').textContent = showFinal ? 'Every world. Always you.' : world.title;
    document.getElementById('giftNote').textContent = showFinal
      ? 'Piluuuu, tumne meri har chhoti duniya mein pyaar dhoondh liya. Par mera sabse bada secret? Meri favourite duniya woh hai jismein tum ho. Mountains ho, forest ho, ya saare galaxies — ghar wahi hai jahaan tum ho. Happy birthday, meri jaan. Aaj, kal, aur hamesha. Sirf tum. ♡'
      : world.note;
    document.getElementById('giftCount').textContent = showFinal ? 'Four little worlds. One favourite person.' : found.size === 4 ? 'Your constellation is complete. One last letter is waiting.' : `${found.size} of 4 little wonders found. There is love in every world.`;
    document.getElementById('keepMoment').textContent = found.size === 4 && !showFinal ? 'One last thing, my love ♡' : 'Keep this little moment ♡';
    updateCollection();
    if (!dialog.open) dialog.showModal();
    if (!reducedMotion.matches) dialog.animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' });
  }
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  });
  panel.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]');
    if (!choice) return;
    applyWorld(choice.dataset.choice, true);
    writeStored('birthday-theme', active.id);
    closePanel(true);
  });
  document.addEventListener('click', event => {
    if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) closePanel();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) closePanel(true);
  });
  keepsakes.addEventListener('click', event => {
    const object = event.target.closest('[data-keepsake]');
    if (!object) return;
    const world = worlds.find(item => item.id === object.dataset.keepsake);
    const isNew = !found.has(world.id);
    found.add(world.id);
    writeStored('birthday-discoveries-v2', JSON.stringify([...found]));
    openLetter(world, isNew);
  });
  collection.addEventListener('click', () => openLetter(worlds.find(world => found.has(world.id)), false, found.size === 4));
  document.getElementById('keepMoment').addEventListener('click', () => {
    if (found.size === 4 && !finalLetter) openLetter(active, false, true);
    else dialog.close();
  });
  dialog.querySelector('.gift-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  applyWorld(initial);
  updateCollection();
})();
