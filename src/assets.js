// =============================================================
// ASSETS — load the current theme's sprites and sounds.
// If a sprite is missing, sprite(name) returns null and the
// renderer falls back to a colored rectangle. Game never crashes.
// =============================================================

import { DEFAULT_THEME } from "./config.js";

const images = new Map();
const sounds = new Map();
let themeColors = {};
let themeName = DEFAULT_THEME;

export async function loadTheme(name = DEFAULT_THEME) {
  themeName = name;
  images.clear();
  sounds.clear();
  themeColors = {};

  const base = `/themes/${name}`;
  let manifest;
  try {
    const res = await fetch(`${base}/manifest.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`manifest ${res.status}`);
    manifest = await res.json();
  } catch (err) {
    console.warn(`[assets] no manifest for theme "${name}" — using fallbacks.`, err);
    return;
  }

  themeColors = manifest.colors || {};

  // Load images. Missing files are silently skipped so the game still runs.
  const imgPromises = Object.entries(manifest.sprites || {}).map(
    ([key, file]) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          images.set(key, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`[assets] missing sprite: ${file}`);
          resolve();
        };
        img.src = `${base}/${file}`;
      }),
  );

  // Load sounds the same forgiving way.
  const sndPromises = Object.entries(manifest.sounds || {}).map(
    ([key, file]) =>
      new Promise((resolve) => {
        const audio = new Audio();
        audio.preload = "auto";
        audio.oncanplaythrough = () => {
          sounds.set(key, audio);
          resolve();
        };
        audio.onerror = () => {
          console.warn(`[assets] missing sound: ${file}`);
          resolve();
        };
        audio.src = `${base}/${file}`;
      }),
  );

  await Promise.all([...imgPromises, ...sndPromises]);
}

export function sprite(name) {
  return images.get(name) || null;
}

export function soundClip(name) {
  return sounds.get(name) || null;
}

export function color(name, fallback) {
  return themeColors[name] || fallback;
}

export function currentTheme() {
  return themeName;
}
