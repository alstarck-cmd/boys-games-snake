// =============================================================
// CONFIG — change numbers here, see the game change!
// This is the FIRST FILE to play with. Save and reload the page.
// =============================================================

export const GRID_COLS = 48;        // how many squares wide the board is
export const GRID_ROWS = 36;        // how many squares tall the board is
export const CELL_SIZE = 24;        // pixels per square

export const START_SPEED = 7;       // moves per second at the start
export const SPEED_PER_FOOD = 0.15; // game gets this much faster every time you eat
export const MAX_SPEED = 18;        // top speed cap so it doesn't get impossible

export const START_LENGTH = 20;      // how long the snake is when you start
export const GROW_PER_FOOD = 2;     // how many segments you gain per food

export const FOOD_PER_BOARD = 1;    // food items on the board at once (solo mode)
export const FOOD_PER_BOARD_VS = 2; // food items in versus mode

export const COUNTDOWN_SECONDS = 3.5; // 3 seconds of "3,2,1" then half a second of "GO!"

// Colors used when sprites are missing or fall back to rectangles.
export const COLORS = {
  background: "#0a0a0a",
  grid:       "#141414",
  food:       "#ef4444",
  p1Head:     "#4ade80",
  p1Body:     "#22c55e",
  p2Head:     "#60a5fa",
  p2Body:     "#3b82f6",
};

// Show the on-screen d-pad. Boys can toggle later.
export const SHOW_DPAD = true;

// Which theme folder to load from /themes/
export const DEFAULT_THEME = "classic";
