(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.getElementById("stardust");
  const ctx = canvas.getContext("2d");
  const audio = document.getElementById("bgMusic");
  const progress = document.getElementById("musicProgress");
  const whispers = [
    "If happiness had a name, it would be yours.",
    "My favourite place? Wherever you are.",
    "Tum ho, toh har din thoda aur khoobsurat hai.",
    "A thousand wishes. All of them, for you.",
    "You make ordinary days feel like little miracles."
  ];
  let whisperIndex = 0;
  let width = 0, height = 0, animationId = 0, lastFrame = 0;
  let stars = [], sparks = [];
  const pointer = { x: -1000, y: -1000 };
  const random = (min, max) => min + Math.random() * (max - min);

  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(85, Math.round(width * height / 12500)) }, () => ({
      x: random(0, width), y: random(0, height), size: random(.4, 1.4), phase: random(0, Math.PI * 2), speed: random(.04, .16)
    }));
    if (reducedMotion.matches) draw(0);
  }

  function draw(time) {
    if (!ctx) return;
    const delta = Math.min((time - lastFrame) / 16.67 || 1, 2);
    lastFrame = time;
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      if (!reducedMotion.matches) star.y -= star.speed * delta;
      if (star.y < 0) star.y = height;
      const distance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
      const glow = Math.max(0, 1 - distance / 130);
      ctx.beginPath();
      ctx.fillStyle = `rgba(239,216,184,${.25 + Math.sin(time / 1800 + star.phase) * .18 + glow * .4})`;
      ctx.arc(star.x, star.y, star.size + glow, 0, Math.PI * 2);
      ctx.fill();
      if (glow > .25) {
        ctx.beginPath(); ctx.strokeStyle = `rgba(238,194,213,${glow * .09})`;
        ctx.moveTo(star.x, star.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }
    }
    sparks = sparks.filter(spark => spark.life > 0);
    for (const spark of sparks) {
      spark.x += spark.vx * delta; spark.y += spark.vy * delta;
      spark.vy += .015 * delta; spark.life -= .018 * delta;
      ctx.save(); ctx.translate(spark.x, spark.y); ctx.rotate(spark.life * 2);
      ctx.globalAlpha = Math.max(0, spark.life);
      ctx.fillStyle = spark.color;
      ctx.font = `${spark.size}px Georgia`;
      ctx.fillText(spark.flower ? "✿" : "✦", 0, 0); ctx.restore();
    }
    if (!document.hidden && !reducedMotion.matches) animationId = requestAnimationFrame(draw);
  }

  function burst(x, y, flower = false) {
    if (reducedMotion.matches) return;
    for (let i = 0; i < (flower ? 30 : 13); i++) {
      const angle = random(0, Math.PI * 2), speed = random(.5, flower ? 4.8 : 2.2);
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - .6,
        life: 1, size: random(flower ? 10 : 3, flower ? 24 : 9), flower,
        color: ["#edbed0", "#d8bd91", "#b7add5", "#dce0b8"][i % 4] });
    }
    sparks = sparks.slice(-160);
  }

  document.addEventListener("pointermove", event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
  document.addEventListener("pointerdown", event => burst(event.clientX, event.clientY), { passive: true });
  document.addEventListener("pointerleave", () => { pointer.x = -1000; pointer.y = -1000; });
  window.addEventListener("resize", resize, { passive: true });
  function restartAnimation() {
    cancelAnimationFrame(animationId);
    lastFrame = 0;
    if (!document.hidden) {
      if (reducedMotion.matches) draw(0);
      else animationId = requestAnimationFrame(draw);
    }
  }
  document.addEventListener("visibilitychange", restartAnimation);
  reducedMotion.addEventListener("change", restartAnimation);

  document.getElementById("bloomButton").addEventListener("click", event => {
    const rect = event.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top, true);
    document.getElementById("loveWhisper").textContent = whispers[whisperIndex++ % whispers.length];
    if (reducedMotion.matches) return;
    for (let i = 0; i < 9; i++) {
      const petal = document.createElement("span");
      petal.className = "bloom-particle";
      petal.textContent = i % 2 ? "♡" : "✿";
      petal.style.cssText = `left:${random(20, 80)}vw;top:${random(55, 85)}vh;font-size:${random(15, 30)}px;--drift:${random(-90, 90)}px;--spin:${random(-120, 120)}deg`;
      document.body.appendChild(petal);
      petal.addEventListener("animationend", () => petal.remove(), { once: true });
      setTimeout(() => petal.remove(), 2600);
    }
  });

  audio.addEventListener("playing", () => document.body.classList.add("music-playing"));
  audio.addEventListener("pause", () => document.body.classList.remove("music-playing"));
  audio.addEventListener("timeupdate", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      progress.value = String(audio.currentTime / audio.duration * 100);
      const seconds = Math.floor(audio.currentTime);
      progress.setAttribute("aria-valuetext", `${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`);
    }
  });
  progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Number(progress.value) / 100 * audio.duration;
  });
  document.getElementById("openButton").addEventListener("click", () => {
    const heading = document.querySelector(".scene-heading h2");
    heading.tabIndex = -1;
    setTimeout(() => heading.focus({ preventScroll: true }), 1000);
  });
  // A local flower celebration works even if the confetti CDN is unavailable.
  document.getElementById("wishButton").addEventListener("click", () => burst(width / 2, height * .4, true));
  const observer = new MutationObserver(() => {
    if (document.body.classList.contains("blown")) {
      burst(width / 2, height * .4, true);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  resize();
  restartAnimation();
})();
