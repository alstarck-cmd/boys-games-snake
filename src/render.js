// =============================================================
// RENDER — draws the board, snakes, and food.
// Tries to draw sprites first; falls back to colored rectangles.
// =============================================================

import { GRID_COLS, GRID_ROWS, CELL_SIZE, COLORS } from "./config.js";
import { sprite, color } from "./assets.js";

let canvas = null;
let ctx = null;

export function attach(canvasEl) {
  canvas = canvasEl;
  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Fit board into the viewport while keeping a square grid.
  const maxW = Math.min(window.innerWidth - 24, 600);
  const maxH = window.innerHeight * 0.7;
  const target = Math.min(maxW, maxH);
  const cell = Math.floor(target / Math.max(GRID_COLS, GRID_ROWS));
  const pxW = cell * GRID_COLS;
  const pxH = cell * GRID_ROWS;
  canvas.style.width = `${pxW}px`;
  canvas.style.height = `${pxH}px`;
  canvas.width = pxW * dpr;
  canvas.height = pxH * dpr;
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas._cell = cell;
}

export function draw(state) {
  if (!ctx) return;
  const cell = canvas._cell || CELL_SIZE;

  // Background.
  ctx.fillStyle = color("background", COLORS.background);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Light grid lines so the play area is visible.
  ctx.fillStyle = color("grid", COLORS.grid);
  for (let x = 0; x < GRID_COLS; x++) {
    for (let y = 0; y < GRID_ROWS; y++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  // Food.
  for (const food of state.foods) {
    drawCell(food.x, food.y, cell, "food", color("food", COLORS.food));
  }

  // Snakes (head sprite for index 0, body sprite for the rest).
  state.snakes.forEach((snake, i) => {
    const isP2 = i === 1;
    const headColor = isP2 ? COLORS.p2Head : COLORS.p1Head;
    const bodyColor = isP2 ? COLORS.p2Body : COLORS.p1Body;
    const headSprite = isP2 ? "p2-head" : "snake-head";
    const bodySprite = isP2 ? "p2-body" : "snake-body";

    snake.body.forEach((seg, idx) => {
      const name = idx === 0 ? headSprite : bodySprite;
      const fallback = idx === 0 ? headColor : bodyColor;
      drawCell(seg.x, seg.y, cell, name, fallback, snake.alive ? 1 : 0.4);
    });
  });
}

function drawCell(gx, gy, cell, spriteName, fallbackColor, alpha = 1) {
  const px = gx * cell;
  const py = gy * cell;
  const img = sprite(spriteName);
  ctx.globalAlpha = alpha;
  if (img) {
    ctx.drawImage(img, px, py, cell, cell);
  } else {
    ctx.fillStyle = fallbackColor;
    const pad = Math.max(1, Math.floor(cell * 0.08));
    ctx.fillRect(px + pad, py + pad, cell - pad * 2, cell - pad * 2);
  }
  ctx.globalAlpha = 1;
}
