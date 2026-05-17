// =============================================================
// INPUT — touch swipes, on-screen d-pad, and keyboard.
// In solo mode, the whole board is P1's swipe area.
// In versus mode, left half = P1, right half = P2.
// =============================================================

const SWIPE_DEADZONE = 20; // pixels before a touch counts as a swipe

export function attach({ canvas, dpadP1, dpadP2, versus, onTurn }) {
  // ---------- Touch / swipe ----------
  const active = new Map(); // touch identifier -> { startX, startY, player }

  function playerForTouch(clientX) {
    if (!versus) return 0;
    const rect = canvas.getBoundingClientRect();
    return clientX < rect.left + rect.width / 2 ? 0 : 1;
  }

  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        active.set(t.identifier, {
          startX: t.clientX,
          startY: t.clientY,
          player: playerForTouch(t.clientX),
          fired: false,
        });
      }
    },
    { passive: false },
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const a = active.get(t.identifier);
        if (!a || a.fired) continue;
        const dx = t.clientX - a.startX;
        const dy = t.clientY - a.startY;
        const dir = swipeDirection(dx, dy);
        if (dir) {
          a.fired = true;
          onTurn(a.player, dir);
        }
      }
    },
    { passive: false },
  );

  canvas.addEventListener("touchend", (e) => {
    for (const t of e.changedTouches) active.delete(t.identifier);
  });
  canvas.addEventListener("touchcancel", (e) => {
    for (const t of e.changedTouches) active.delete(t.identifier);
  });

  // Mouse for desktop testing.
  let mouseStart = null;
  canvas.addEventListener("mousedown", (e) => {
    mouseStart = { x: e.clientX, y: e.clientY, player: playerForTouch(e.clientX) };
  });
  canvas.addEventListener("mouseup", (e) => {
    if (!mouseStart) return;
    const dir = swipeDirection(e.clientX - mouseStart.x, e.clientY - mouseStart.y);
    if (dir) onTurn(mouseStart.player, dir);
    mouseStart = null;
  });

  // ---------- D-pad ----------
  bindDpad(dpadP1, 0, onTurn);
  if (versus) bindDpad(dpadP2, 1, onTurn);

  // ---------- Keyboard ----------
  window.addEventListener("keydown", (e) => {
    const dir = keyToDir(e.key);
    if (!dir) return;
    e.preventDefault();
    // Arrows + IJKL = P1; WASD = P2 in versus, also P1 in solo.
    const isP2Key = ["w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key);
    const player = versus && isP2Key ? 1 : 0;
    onTurn(player, dir);
  });
}

function swipeDirection(dx, dy) {
  if (Math.abs(dx) < SWIPE_DEADZONE && Math.abs(dy) < SWIPE_DEADZONE) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

function bindDpad(dpad, player, onTurn) {
  if (!dpad) return;
  for (const btn of dpad.querySelectorAll("button")) {
    const dir = btn.dataset.dir;
    const fire = (e) => {
      e.preventDefault();
      onTurn(player, dir);
    };
    btn.addEventListener("touchstart", fire, { passive: false });
    btn.addEventListener("mousedown", fire);
  }
}

function keyToDir(key) {
  switch (key) {
    case "ArrowUp":
    case "i":
    case "I":
      return "up";
    case "ArrowDown":
    case "k":
    case "K":
      return "down";
    case "ArrowLeft":
    case "j":
    case "J":
      return "left";
    case "ArrowRight":
    case "l":
    case "L":
      return "right";
    case "w":
    case "W":
      return "up";
    case "s":
    case "S":
      return "down";
    case "a":
    case "A":
      return "left";
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}
