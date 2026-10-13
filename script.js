// ---------- Key map: letter -> note, solfege, frequency (Hz) ----------
const notes = {
  a: { note: "C", solfege: "Do",  freq: 262 },
  s: { note: "D", solfege: "Re",  freq: 294 },
  d: { note: "E", solfege: "Mi",  freq: 330 },
  f: { note: "F", solfege: "Fa",  freq: 349 },
  g: { note: "G", solfege: "Sol", freq: 392 },
  h: { note: "A", solfege: "La",  freq: 440 },
  j: { note: "B", solfege: "Ti",  freq: 494 },
  k: { note: "C", solfege: "Do",  freq: 523 },
  // Bonus: sharps (black keys)
  w: { note: "C#", solfege: "Do#",  freq: 277 },
  e: { note: "D#", solfege: "Re#",  freq: 311 },
  t: { note: "F#", solfege: "Fa#",  freq: 370 },
  y: { note: "G#", solfege: "Sol#", freq: 415 },
  u: { note: "A#", solfege: "La#",  freq: 466 }
};

const statusLine = document.querySelector("#status");
const instrumentSelect = document.querySelector("#instrument");

// ---------- Sound helper ----------
const ctx = new AudioContext();

// Each instrument is a recipe: layers of [wave type, pitch multiplier, volume],
// how fast the note starts (attack) and how long it rings (dur, in seconds)
const instruments = {
  piano:    { layers: [["triangle", 1, 0.5], ["sine", 2, 0.25], ["sine", 3, 0.1]], attack: 0.005, dur: 1.4 },
  electric: { layers: [["sine", 1, 0.5], ["sine", 2, 0.3], ["triangle", 4, 0.08]], attack: 0.005, dur: 1.2 },
  organ:    { layers: [["sine", 1, 0.4], ["sine", 2, 0.3], ["sine", 3, 0.2], ["sine", 4, 0.1]], attack: 0.03, dur: 0.9 },
  harp:     { layers: [["triangle", 1, 0.5], ["sine", 2, 0.2]], attack: 0.002, dur: 1.0 },
  bell:     { layers: [["sine", 1, 0.4], ["sine", 2.76, 0.25], ["sine", 5.4, 0.12]], attack: 0.002, dur: 2.2 },
  strings:  { layers: [["sawtooth", 1, 0.18], ["sawtooth", 1.005, 0.18]], attack: 0.18, dur: 1.3 },
  synth:    { layers: [["square", 1, 0.2], ["sawtooth", 0.5, 0.15]], attack: 0.01, dur: 0.6 },
  sine:     { layers: [["sine", 1, 0.6]], attack: 0.01, dur: 0.4 },
  square:   { layers: [["square", 1, 0.25]], attack: 0.01, dur: 0.4 },
  triangle: { layers: [["triangle", 1, 0.6]], attack: 0.01, dur: 0.4 },
  sawtooth: { layers: [["sawtooth", 1, 0.25]], attack: 0.01, dur: 0.4 }
};

function playNote(freq) {
  // Browsers block sound until the user interacts; resume if needed
  if (ctx.state === "suspended") ctx.resume();

  const inst = instruments[instrumentSelect.value];
  const now = ctx.currentTime;

  // One gain node shapes the whole note: quick start, then a smooth fade out
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + inst.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + inst.dur);
  gain.connect(ctx.destination);

  // Stack the layers to build the instrument's tone
  inst.layers.forEach(function (layer) {
    const osc = ctx.createOscillator();
    const level = ctx.createGain();
    osc.type = layer[0];
    osc.frequency.value = freq * layer[1];
    level.gain.value = layer[2];
    osc.connect(level);
    level.connect(gain);
    osc.start(now);
    osc.stop(now + inst.dur);
  });
}

// ---------- Detail: a little note floats up from the key ----------
function spawnNote(keyEl) {
  const rect = keyEl.getBoundingClientRect();
  const n = document.createElement("span");
  n.className = "fx-note";
  n.textContent = ["\u266A", "\u266B", "\u2669"][Math.floor(Math.random() * 3)];
  n.style.left = rect.left + rect.width / 2 + "px";
  n.style.top = rect.top + "px";
  n.style.color = Math.random() < 0.5 ? "#c98b4f" : "#6a4128";
  n.style.setProperty("--dx", Math.random() * 60 - 30 + "px");
  n.style.setProperty("--rot", Math.random() * 50 - 25 + "deg");
  document.body.appendChild(n);
  setTimeout(function () { n.remove(); }, 1200);
}

// ---------- Detail: ring, sparkles and a glow pulse when a key is pressed ----------
function spawnEffects(keyEl) {
  const rect = keyEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height * 0.55;

  // A beam of light rises from the key (blue for the black keys)
  const beam = document.createElement("span");
  beam.className = "fx-beam" + (keyEl.classList.contains("black") ? " blue" : "");
  beam.style.left = rect.left + "px";
  beam.style.width = rect.width + "px";
  beam.style.top = rect.top - 190 + "px";
  document.body.appendChild(beam);
  setTimeout(function () { beam.remove(); }, 700);

  const ring = document.createElement("span");
  ring.className = "fx-ring";
  ring.style.left = x + "px";
  ring.style.top = y + "px";
  document.body.appendChild(ring);
  setTimeout(function () { ring.remove(); }, 700);

  for (let i = 0; i < 6; i++) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.6;
    const dist = 40 + Math.random() * 30;
    spark.className = "fx-spark";
    spark.textContent = "\u2726";
    spark.style.left = x + "px";
    spark.style.top = y + "px";
    spark.style.color = i % 2 ? "#c98b4f" : "#6a4128";
    spark.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    spark.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    document.body.appendChild(spark);
    setTimeout(function () { spark.remove(); }, 800);
  }

  const box = document.querySelector(".case");
  box.classList.remove("pulse");
  void box.offsetWidth;                    // restart the animation
  box.classList.add("pulse");
}

// ---------- Press / release one key ----------
function pressKey(letter) {
  const info = notes[letter];
  if (!info) return;                       // not a piano key: do nothing

  const keyEl = document.querySelector('[data-key="' + letter + '"]');
  keyEl.classList.add("active");
  playNote(info.freq);
  spawnNote(keyEl);
  spawnEffects(keyEl);
  statusLine.textContent = letter.toUpperCase() + " is pressed: key lights up + plays " + info.solfege;
  statusLine.classList.remove("pop");       // little pop on the display
  void statusLine.offsetWidth;
  statusLine.classList.add("pop");
  songProgress(letter);                    // advance the song guide, if one is running
}

function releaseKey(letter) {
  const keyEl = document.querySelector('[data-key="' + letter + '"]');
  if (keyEl) keyEl.classList.remove("active");
}

// ---------- Keyboard listeners ----------
document.addEventListener("keydown", function (e) {
  if (e.repeat) return;                              // ignore holding the key down
  if (e.ctrlKey || e.metaKey || e.altKey) return;    // keep browser shortcuts working
  pressKey(e.key.toLowerCase());                     // works with Caps Lock too
});

document.addEventListener("keyup", function (e) {
  releaseKey(e.key.toLowerCase());
});

// ---------- Bonus: click / touch to play ----------
document.querySelectorAll(".key").forEach(function (keyEl) {
  const letter = keyEl.dataset.key;
  keyEl.addEventListener("pointerdown", function () { pressKey(letter); });
  keyEl.addEventListener("pointerup", function () { releaseKey(letter); });
  keyEl.addEventListener("pointerleave", function () { releaseKey(letter); });
  keyEl.addEventListener("pointercancel", function () { releaseKey(letter); });
});

// ---------- Songbook: tap a song, then follow the glowing keys ----------
const songs = [
  { name: "Mary Had a Little Lamb",        phrases: ["D S A S", "D D D"] },
  { name: "Twinkle, Twinkle, Little Star", phrases: ["A A G G", "H H G"] },
  { name: "Ode to Joy",                    phrases: ["D D F G", "G F D S"] }
];
const songbook = document.querySelector("#songbook");
let activeCard = null;
let activeChips = null;
let step = 0;

songs.forEach(function (song) {
  const card = document.createElement("div");
  card.className = "song-card";

  const title = document.createElement("h3");
  title.textContent = song.name;
  const state = document.createElement("p");
  state.className = "song-status";
  state.textContent = "Tap to play along";
  const box = document.createElement("div");
  box.className = "phrases";

  song.phrases.forEach(function (phrase) {          // each phrase sits in its own ( ) brackets
    const row = document.createElement("p");
    row.className = "phrase";
    phrase.split(" ").forEach(function (letter) {
      const chip = document.createElement("kbd");
      chip.className = "chip";
      chip.dataset.letter = letter.toLowerCase();
      chip.textContent = letter;
      row.appendChild(chip);
    });
    box.appendChild(row);
  });

  card.append(title, state, box);
  card.addEventListener("click", function () { startSong(card); });
  songbook.appendChild(card);
});

function resetCard(card) {
  card.classList.remove("playing", "complete");
  card.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("next", "done"); });
  card.querySelector(".song-status").textContent = "Tap to play along";
}

function startSong(card) {
  if (activeCard) resetCard(activeCard);
  resetCard(card);
  activeCard = card;
  activeChips = card.querySelectorAll(".chip");
  step = 0;
  card.classList.add("playing");
  activeChips[0].classList.add("next");
  card.querySelector(".song-status").textContent = "Follow the glowing key";
}

function songProgress(letter) {
  if (!activeChips) return;
  const chip = activeChips[step];

  if (letter !== chip.dataset.letter) {              // wrong key: the glowing chip nudges
    chip.classList.remove("miss");
    void chip.offsetWidth;
    chip.classList.add("miss");
    return;
  }

  chip.classList.remove("next");
  chip.classList.add("done");
  step++;

  if (step < activeChips.length) {
    activeChips[step].classList.add("next");
    return;
  }

  // Song finished: celebrate with a wave of notes across the piano
  activeCard.classList.remove("playing");
  activeCard.classList.add("complete");
  activeCard.querySelector(".song-status").textContent = "Song complete. Beautifully played!";
  activeChips = null;
  document.querySelectorAll(".piano > .key:not(.black)").forEach(function (k, i) {
    setTimeout(function () { spawnNote(k); }, i * 110);
  });
}

// ---------- Words about songs: a new line appears every few seconds ----------
const quotes = [
  "Every song begins with a single note.",
  "A song is a little home you can carry anywhere.",
  "Some songs are not heard, they are remembered.",
  "Hum it once, and it becomes yours forever.",
  "Behind every favorite song, there is a favorite moment."
];
const quoteEl = document.querySelector("#quote");
let quoteIndex = 1;
quoteEl.textContent = quotes[0];

setInterval(function () {
  quoteEl.classList.add("fade");                       // fade out, swap the text, fade in
  setTimeout(function () {
    quoteEl.textContent = quotes[quoteIndex % quotes.length];
    quoteIndex++;
    quoteEl.classList.remove("fade");
  }, 600);
}, 7000);
