const birthdayName = "my dear piluuuu urf smituuuuuu";
const nameText = document.getElementById("nameText");
const openButton = document.getElementById("openButton");
const entryScreen = document.getElementById("entryScreen");
const surpriseScreen = document.getElementById("surpriseScreen");
const finaleOverlay = document.getElementById("finaleOverlay");
const statusText = document.getElementById("statusText");
const music = document.getElementById("bgMusic");
const candles = [...document.querySelectorAll(".candle")];

const BLOW_THRESHOLD = 0.45;

nameText.textContent = birthdayName;

music.volume = 0.75;

let musicStarted = false;
let micReady = false;
let analyser = null;
let dataArray = null;
let blowTriggered = false;

async function startMagic() {
  if (musicStarted) return;
  musicStarted = true;

  entryScreen.classList.add("hidden");
  surpriseScreen.classList.add("visible");

  try {
    await music.play();
  } catch (error) {
    console.warn("Audio play was blocked before interaction. The user action already started the flow.", error);
  }

  await initMicrophone();
}

openButton.addEventListener("click", startMagic);

async function initMicrophone() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusText.textContent = "Microphone not supported on this device";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioCtx();
    const source = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    micReady = true;
    statusText.textContent = "Blow gently to make the wish come true";

    requestAnimationFrame(updateVolume);
  } catch (error) {
    console.warn("Microphone permission failed or was blocked.", error);
    statusText.textContent = "Tap the candles to make the magic bloom";
    surpriseScreen.addEventListener("pointerdown", triggerBlowOut, { once: true });
  }
}

function updateVolume() {
  if (!analyser || !dataArray) {
    return;
  }

  analyser.getByteFrequencyData(dataArray);

  let total = 0;
  for (let i = 0; i < dataArray.length; i += 1) {
    total += dataArray[i];
  }

  const averageVolume = total / dataArray.length / 255;

  if (averageVolume > BLOW_THRESHOLD && !blowTriggered) {
    triggerBlowOut();
  }

  requestAnimationFrame(updateVolume);
}

function triggerBlowOut() {
  if (blowTriggered) return;
  blowTriggered = true;

  document.body.classList.add("blown");
  statusText.textContent = "The wish has been made...";

  candles.forEach((candle) => {
    candle.classList.add("extinguished");
  });

  setTimeout(() => {
    launchConfetti();
    finaleOverlay.classList.add("visible");
  }, 900);
}

function launchConfetti() {
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
