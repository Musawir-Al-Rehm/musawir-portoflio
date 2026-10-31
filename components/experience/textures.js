// Small helpers for textures drawn with the 2D canvas API (no image downloads).
import * as THREE from "three";

export const cssFont = (name, fallback) =>
  (typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;

export const FONTS = {
  serif: () => cssFont("--font-instrument", "Georgia, serif"),
  mono: () => cssFont("--font-geist-mono", "Menlo, monospace"),
  hand: () => cssFont("--font-caveat", "'Comic Sans MS', cursive"),
};

// Draws once now, and again when the web fonts have finished loading.
export function canvasTexture(w, h, draw) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const run = () => {
    draw(canvas.getContext("2d"), w, h);
    tex.needsUpdate = true;
  };
  run();
  document.fonts?.ready.then(run);
  return tex;
}

// Same random numbers on every load.
export function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}