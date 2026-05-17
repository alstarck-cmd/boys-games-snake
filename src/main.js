// =============================================================
// MAIN — boots the game: load assets, hook up screens & input,
// run the tick loop. Screens are plain DOM divs in index.html.
// =============================================================

import { DEFAULT_THEME, SHOW_DPAD } from "./config.js";
import { loadTheme } from "./assets.js";
import { newGame, tick, queueTurn } from "./game.js";
import * as render from "./render.js";
import * as input from "./input.js";
import { play, unlockAudio } from "./sound.js";

const screens = {
  title: document.getElementById("title-screen"),
  game: document.getElementById("game-screen"),
  gameover: document.getElementById("gameover-screen"),
};

const canvas = document.getElementById("board");
const scoreP1 = document.getElementById("score-p1");
const scoreP2 = document.getElementById("score-p2");
const dpadP1 = document.getElementById("dpad-p1");
const dpadP2 = document.getElementById("dpad-p2");
const gameoverTitle = document.getElementById("gameover-title");
const gameoverDetail = document.getElementById("gameover-detail");

let state = null;
let mode = "solo";
let loop = null;
let inputAttached = false;
let lastScores = [0, 0];

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle("hidden", key !== name);
  }
}

function startGame(selectedMode) {
  mode = selectedMode;
  state = newGame(mode);
  lastScores = [0, 0];

  render.attach(canvas);

  if (!inputAttached) {
    input.attach({
      canvas,
      dpadP1,
      dpadP2,
      versus: mode === "versus",
      onTurn: (player, dir) => {
        unlockAudio();
        if (state) queueTurn(state, player, dir);
      },
    });
    inputAttached = true;
  }

  scoreP2.classList.toggle("hidden", mode !== "versus");
  dpadP1.classList.toggle("hidden", !SHOW_DPAD);
  dpadP2.classList.toggle("hidden", !(SHOW_DPAD && mode === "versus"));

  showScreen("game");
  startLoop();
}

function startLoop() {
  stopLoop();
  let last = performance.now();
  let acc = 0;

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    acc += dt;
    const step = 1 / state.speed;
    while (acc >= step && !state.over) {
      acc -= step;
      const aliveBefore = state.snakes.filter((s) => s.alive).length;
      tick(state);
      playSoundsForChanges(aliveBefore);
    }
    updateHud();
    render.draw(state);
    if (state.over) {
      stopLoop();
      endGame();
      return;
    }
    loop = requestAnimationFrame(frame);
  }
  loop = requestAnimationFrame(frame);
}

function stopLoop() {
  if (loop) cancelAnimationFrame(loop);
  loop = null;
}

function playSoundsForChanges(aliveBefore) {
  state.snakes.forEach((s, i) => {
    if (s.score > (lastScores[i] || 0)) play("eat");
    lastScores[i] = s.score;
  });
  const aliveAfter = state.snakes.filter((s) => s.alive).length;
  if (aliveAfter < aliveBefore) play("crash");
}

function updateHud() {
  scoreP1.textContent = state.snakes[0]?.score ?? 0;
  if (state.snakes[1]) scoreP2.textContent = state.snakes[1].score;
}

function endGame() {
  if (mode === "versus") {
    if (state.winner === null) {
      gameoverTitle.textContent = "Tie!";
      gameoverDetail.textContent = "Both snakes crashed.";
    } else {
      gameoverTitle.textContent = `Player ${state.winner + 1} wins!`;
      gameoverDetail.textContent = `Score: ${state.snakes[state.winner].score}`;
    }
  } else {
    gameoverTitle.textContent = "Game Over";
    gameoverDetail.textContent = `Score: ${state.snakes[0].score}`;
  }
  showScreen("gameover");
}

for (const btn of document.querySelectorAll("[data-mode]")) {
  btn.addEventListener("click", () => {
    unlockAudio();
    startGame(btn.dataset.mode);
  });
}

document.getElementById("play-again").addEventListener("click", () => startGame(mode));
document.getElementById("back-to-title").addEventListener("click", () => {
  stopLoop();
  showScreen("title");
});

(async function boot() {
  await loadTheme(DEFAULT_THEME);
  showScreen("title");
})();
