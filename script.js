const birthdayName = "my dear piluuuu urf smituuuuuu";
const nameText = document.getElementById("nameText");
const openButton = document.getElementById("openButton");
const entryScreen = document.getElementById("entryScreen");
const surpriseScreen = document.getElementById("surpriseScreen");
const finaleOverlay = document.getElementById("finaleOverlay");
const statusText = document.getElementById("statusText");
const music = document.getElementById("bgMusic");
const candles = [...document.querySelectorAll(".candle")];

const BLOW_THRESHOLD = 0.075;
const micButton = document.getElementById("micButton");
const musicButton = document.getElementById("musicButton");
const musicStatus = document.getElementById("musicStatus");
nameText.textContent = birthdayName;
music.volume = 0.35;
let opened = false, micPending = false, blowTriggered = false;
let analyser, dataArray, audioContext, micStream, frameId;
let loudSince = null;
let calibrationStart = null;
let ambientLevel = 0;
let ambientSamples = 0;
function playMusic() {
  musicStatus.textContent = "Loading your song...";
  const pending = music.play();
  if (pending) pending.catch(() => {
    musicStatus.textContent = "The music is taking a moment. Tap Play music to try again.";
    musicButton.textContent = "Play music";
  });
}
music.addEventListener("playing", () => {
  musicStatus.textContent = "";
  musicButton.textContent = "Pause music";
});
music.addEventListener("error", () => {
  musicStatus.textContent = "The song couldn't load. Tap Retry music to try again.";
  musicButton.textContent = "Retry music";
});
musicButton.addEventListener("click", () => {
  if (!music.paused) {
    music.pause();
    musicButton.textContent = "Play music";
  } else {
    if (music.error) music.load();
    playMusic();
  }
});
function startMagic() {
  if (opened) return;
  opened = true;
  entryScreen.classList.add("hidden");
  entryScreen.inert = true;
  surpriseScreen.classList.add("visible");
  surpriseScreen.inert = false;
  document.body.classList.add("wishing");
  document.getElementById("chapterTwo").classList.add("active");
  document.getElementById("musicControls").hidden = false;
  // Both requests start during the tap; remote music never delays the mic prompt.
  playMusic();
  void initMicrophone();
}
openButton.addEventListener("click", startMagic);
micButton.addEventListener("click", initMicrophone);
document.getElementById("wishButton").addEventListener("click", triggerBlowOut);
async function initMicrophone() {
  if (micPending || micStream || blowTriggered) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = "Microphone needs HTTPS or localhost. Open the secure site in Chrome/Safari, or tap below to make your wish.";
    return;
  }
  micPending = true;
  micButton.disabled = true;
  statusText.textContent = "Allow microphone access in your browser to blow out the candles.";
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    // Resume on the tap for mobile browsers.
    const resumed = audioContext.resume();
    const requested = navigator.mediaDevices.getUserMedia({audio: {
      echoCancellation: true, noiseSuppression: false, autoGainControl: false
    }});
    const results = await Promise.allSettled([requested, resumed]);
    if (results[0].status === "fulfilled") micStream = results[0].value;
    for (const result of results) if (result.status === "rejected") throw result.reason;
    if (blowTriggered) { stopMicrophone(); return; }
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    audioContext.createMediaStreamSource(micStream).connect(analyser);
    dataArray = new Uint8Array(analyser.fftSize);
    micButton.hidden = true;
    calibrationStart = null;
    ambientLevel = 0;
    ambientSamples = 0;
    document.body.classList.add("listening");
    statusText.textContent = "Make a wish, then blow gently near your microphone";
    frameId = requestAnimationFrame(updateVolume);
  } catch (error) {
    stopMicrophone();
    if (blowTriggered) return;
    statusText.textContent = error.name === "NotAllowedError" || error.name === "SecurityError"
      ? "Microphone blocked. Allow Microphone in this site's browser settings, then tap Retry microphone. Or tap below to make your wish."
      : "Microphone unavailable. Check your microphone and retry, or tap below to make your wish.";
    micButton.textContent = "Retry microphone";
  } finally {
    micPending = false;
    micButton.disabled = false;
  }
}
function updateVolume(time) {
  if (blowTriggered || !analyser) return;
  analyser.getByteTimeDomainData(dataArray);
  let energy = 0;
  for (const sample of dataArray) energy += ((sample - 128) / 128) ** 2;
  const rms = Math.sqrt(energy / dataArray.length);
  document.querySelectorAll(".mic-meter span").forEach((bar, index) => {
    bar.style.height = `${4 + Math.min(rms * 230, 22) * (0.5 + Math.sin(index + time / 150) * 0.5)}px`;
  });
  if (calibrationStart === null) calibrationStart = time;
  if (time - calibrationStart < 800) {
    ambientLevel += rms;
    ambientSamples++;
    frameId = requestAnimationFrame(updateVolume);
    return;
  }
  const threshold = Math.max(BLOW_THRESHOLD, Math.min(0.24, (ambientLevel / Math.max(1, ambientSamples)) * 2.6));
  if (rms > threshold) {
    if (loudSince === null) loudSince = time;
    if (time - loudSince >= 180) { triggerBlowOut(); return; }
  } else loudSince = null;
  frameId = requestAnimationFrame(updateVolume);
}
function stopMicrophone() {
  document.body.classList.remove("listening");
  cancelAnimationFrame(frameId);
  micStream?.getTracks().forEach(track => track.stop());
  micStream = null;
  analyser = null;
  if (audioContext && audioContext.state !== "closed") void audioContext.close().catch(() => {});
  audioContext = null;
}
window.addEventListener("pagehide", stopMicrophone);

function triggerBlowOut() {
  if (blowTriggered) return;
  blowTriggered = true;
  stopMicrophone();
  document.querySelector(".interaction-controls").hidden = true;

  document.body.classList.add("blown");
  document.getElementById("chapterThree").classList.add("active");
  statusText.textContent = "The wish has been made...";

  candles.forEach((candle) => {
    candle.classList.add("extinguished");
  });

  launchConfetti();
  setTimeout(() => {
    finaleOverlay.classList.add("visible");
    finaleOverlay.inert = false;
    surpriseScreen.inert = true;
    document.getElementById("letterButton").focus({ preventScroll: true });
  }, 900);
}

document.getElementById("letterButton").addEventListener("click", () => {
  const letter = document.getElementById("secretLetter");
  letter.hidden = !letter.hidden;
  document.getElementById("letterButton").textContent = letter.hidden ? "One more little thing ♡" : "Forever yours ♡";
  if (!letter.hidden) letter.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof confetti !== "function") {
    console.warn("Confetti library not available.");
    return;
  }

  confetti({
    particleCount: 160,
    spread: 90,
    startVelocity: 42,
    origin: { y: 0.48 },
    scalar: 1.1,
    colors: ["#ff7ecf", "#ffd76d", "#9fe3ff", "#caa6ff", "#fff5d6"],
  });

  setTimeout(() => {
    confetti({
      particleCount: 220,
      spread: 120,
      startVelocity: 36,
      origin: { y: 0.5 },
      scalar: 1.25,
      colors: ["#ff9ec8", "#ffc76d", "#d0c8ff", "#b8f5d0"],
    });
  }, 180);

  setTimeout(() => {
    confetti({
      particleCount: 260,
      spread: 140,
      startVelocity: 52,
      origin: { y: 0.42 },
      scalar: 1.5,
      colors: ["#ff7ecf", "#ffe4a6", "#8fd3ff", "#b5a4ff"],
    });
  }, 360);
}

// Replace the song URL in the HTML audio tag with your own romantic track.
// Example: music.src = "https://yourdomain.com/your-song.mp3";
// For the browser to allow microphone and audio, the final shared page must be served over HTTPS.
