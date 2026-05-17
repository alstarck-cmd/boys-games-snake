// =============================================================
// GAME — the rules of Snake.
//   - state: where everything is right now
//   - tick:  move everything one step
//   - eat / crash detection
// No drawing happens here. Drawing lives in render.js.
// =============================================================

import {
  GRID_COLS,
  GRID_ROWS,
  START_SPEED,
  SPEED_PER_FOOD,
  MAX_SPEED,
  START_LENGTH,
  GROW_PER_FOOD,
  FOOD_PER_BOARD,
  FOOD_PER_BOARD_VS,
  COUNTDOWN_SECONDS,
} from "./config.js";

export const DIRS = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
};

function opposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function makeSnake(x, y, dir, length) {
  const body = [];
  for (let i = 0; i < length; i++) {
    body.push({ x: x - dir.x * i, y: y - dir.y * i });
  }
  return {
    body,            // index 0 is the head
    dir,             // current direction
    nextDir: dir,    // direction queued by the player for the next tick
    grow: 0,         // segments left to grow
    alive: true,
    score: 0,
  };
}

export function newGame(mode = "solo") {
  const versus = mode === "versus";
  const snakes = [
    makeSnake(Math.floor(GRID_COLS / 4), Math.floor(GRID_ROWS / 2), DIRS.right, START_LENGTH),
  ];
  if (versus) {
    snakes.push(
      makeSnake(
        Math.floor((GRID_COLS * 3) / 4),
        Math.floor(GRID_ROWS / 2),
        DIRS.left,
        START_LENGTH,
      ),
    );
  }
  const state = {
    mode,
    snakes,
    foods: [],
    speed: START_SPEED,
    over: false,
    winner: null,         // index of the surviving snake in versus, or null
    countdown: COUNTDOWN_SECONDS, // main.js counts this down before ticking
  };
  const foodCount = versus ? FOOD_PER_BOARD_VS : FOOD_PER_BOARD;
  for (let i = 0; i < foodCount; i++) spawnFood(state);
  return state;
}

export function queueTurn(state, snakeIndex, dirName) {
  const snake = state.snakes[snakeIndex];
  if (!snake || !snake.alive) return;
  const next = DIRS[dirName];
  if (!next) return;
  // Can't reverse into yourself.
  if (opposite(next, snake.dir)) return;
  snake.nextDir = next;
}

export function tick(state) {
  if (state.over) return;

  // Apply queued turns.
  for (const snake of state.snakes) {
    if (snake.alive) snake.dir = snake.nextDir;
  }

  // Move every snake one step.
  for (const snake of state.snakes) {
    if (!snake.alive) continue;
    const head = snake.body[0];
    const next = { x: head.x + snake.dir.x, y: head.y + snake.dir.y };
    snake.body.unshift(next);
    if (snake.grow > 0) {
      snake.grow -= 1;
    } else {
      snake.body.pop();
    }
  }

  // Check food.
  for (const snake of state.snakes) {
    if (!snake.alive) continue;
    const head = snake.body[0];
    const foodIdx = state.foods.findIndex((f) => f.x === head.x && f.y === head.y);
    if (foodIdx >= 0) {
      state.foods.splice(foodIdx, 1);
      snake.grow += GROW_PER_FOOD;
      snake.score += 1;
      state.speed = Math.min(MAX_SPEED, state.speed + SPEED_PER_FOOD);
      spawnFood(state);
    }
  }

  // Check crashes. We figure out who dies FIRST (looking at every snake's
  // current state), THEN mark them dead. That way two snakes crashing into
  // each other on the same tick always both die together — never one before
  // the other based on array order.
  const willDie = new Set();
  state.snakes.forEach((snake, i) => {
    if (!snake.alive) return;
    const head = snake.body[0];
    // Wall.
    if (head.x < 0 || head.y < 0 || head.x >= GRID_COLS || head.y >= GRID_ROWS) {
      willDie.add(i);
      return;
    }
    // Own body (skip head itself).
    if (snake.body.slice(1).some((s) => s.x === head.x && s.y === head.y)) {
      willDie.add(i);
      return;
    }
    // Other snakes — any segment, including their head if they moved into the same cell.
    for (let j = 0; j < state.snakes.length; j++) {
      if (j === i) continue;
      const other = state.snakes[j];
      if (!other.alive) continue;
      if (other.body.some((s) => s.x === head.x && s.y === head.y)) {
        willDie.add(i);
        return;
      }
    }
  });
  for (const i of willDie) state.snakes[i].alive = false;

  // Decide if the game is over.
  const alive = state.snakes.filter((s) => s.alive);
  if (state.snakes.length === 1 && alive.length === 0) {
    state.over = true;
  } else if (state.snakes.length > 1 && alive.length <= 1) {
    state.over = true;
    state.winner = alive.length === 1 ? state.snakes.indexOf(alive[0]) : null;
  }
}

function spawnFood(state) {
  const occupied = new Set();
  for (const snake of state.snakes) {
    for (const seg of snake.body) occupied.add(`${seg.x},${seg.y}`);
  }
  for (const f of state.foods) occupied.add(`${f.x},${f.y}`);
  const free = [];
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = 0; y < GRID_ROWS; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return;
  const pick = free[Math.floor(Math.random() * free.length)];
  state.foods.push(pick);
}
