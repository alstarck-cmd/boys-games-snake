# Snake 🐍

A Snake game we're building together.

---

## How to play

1. Open the game in a browser (Safari on the iPad, Chrome on a laptop).
2. Tap **1 Player** to play alone, or **2 Players** to play head-to-head on one screen.
3. **Swipe** the screen in the direction you want the snake to turn — up, down, left, right.
4. Or tap the **buttons** in the corner.
5. Eat the red dots to grow. Don't crash into the wall or yourself!
6. In 2-player mode, the **left half** of the screen controls the green snake, the **right half** controls the blue snake. Don't hit each other.

Keyboard (if you're on a laptop):
- **Arrow keys** or **IJKL** — Player 1
- **WASD** — Player 2

---

## How to change how the game feels

Open `src/config.js`. Every number in there changes how the game plays.

Try changing these and see what happens:

| Number | What it does |
|---|---|
| `GRID_COLS` / `GRID_ROWS` | How big the board is |
| `START_SPEED` | How fast the snake moves at the start (try `3` for slow, `15` for fast) |
| `SPEED_PER_FOOD` | How much faster it gets each time you eat |
| `START_LENGTH` | How long the snake is when the game starts |
| `GROW_PER_FOOD` | How many pieces the snake grows when it eats |
| `FOOD_PER_BOARD_VS` | How many foods on the screen in 2-player mode |

**Tip:** save the file, then reload the game in the browser. Don't like the change? Change it back!

---

## How to add your own art

The snake and food are pictures (PNG files) in `themes/classic/`. Replace them with your own drawings.

You need four pictures:

| File name | What it is | Size |
|---|---|---|
| `snake-head.png` | Player 1's snake head | 24 × 24 pixels (or any square) |
| `snake-body.png` | Player 1's snake body | 24 × 24 |
| `p2-head.png` | Player 2's snake head | 24 × 24 |
| `p2-body.png` | Player 2's snake body | 24 × 24 |
| `food.png` | The food the snake eats | 24 × 24 |

**Make pictures on the iPad** (Procreate, Pixaki, or even Notes), AirDrop them to the laptop, drop them in the `themes/classic/` folder, and reload the game.

If a picture is missing, the game just draws a colored square instead. It won't break.

---

## How to add your own sounds

Sounds live in `themes/classic/sounds/`:

| File name | When it plays |
|---|---|
| `eat.mp3` | Every time the snake eats food |
| `crash.mp3` | When the snake crashes |

**Record on the iPad** (Voice Memos works great). Mouth noises, banging on stuff, weird sound effects — anything goes. Export as M4A or MP3, AirDrop to the laptop, drop in the `sounds/` folder, and reload.

If there's no sound file, the game plays a little built-in beep. Game still works.

---

## Running it locally

You can't just double-click `index.html` — modern browsers need a real server. Easiest options:

```bash
# Option 1: any directory becomes a website
npx serve

# Option 2: Vercel's dev server (matches production)
npx vercel dev
```

Then open the URL it prints in your browser.

---

## What's in each file

| File | What it does |
|---|---|
| `src/config.js` | All the numbers you can tweak |
| `src/game.js` | The rules of Snake — moving, eating, crashing |
| `src/render.js` | Draws everything on the screen |
| `src/input.js` | Handles swipes, button taps, and keys |
| `src/assets.js` | Loads the pictures and sounds |
| `src/sound.js` | Plays sounds |
| `src/main.js` | The "boot" file — wires everything together |
| `themes/classic/` | Pictures and sounds for the default look |
