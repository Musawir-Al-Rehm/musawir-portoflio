// The laptop screen as seen in 3D: a boot splash drawn on a canvas.
// Once the camera has flown in, the real HTML terminal takes over.
import * as THREE from "three";

export const W = 1024;
export const H = 640;
export const SCREEN_BG = "#050A1C"; // must match --t-bg in globals.css for a seamless hand-off

export function createScreen() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, ctx: canvas.getContext("2d"), texture };
}

const cssVar = (name, fallback) =>
  (typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;

export const fonts = () => ({
  mono: cssVar("--font-geist-mono", "Menlo, monospace"),
  serif: cssVar("--font-instrument", "Georgia, serif"),
});

export function drawSplash(ctx, progress, label) {
  const f = fonts();
  ctx.fillStyle = SCREEN_BG;
  ctx.fillRect(0, 0, W, H);

  // faint grid
  ctx.strokeStyle = "rgba(124,144,255,0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#F1F4FF";
  ctx.font = `italic 150px ${f.serif}`;
  ctx.fillText("MR", W / 2, H / 2 + 20);

  ctx.font = `20px ${f.mono}`;
  ctx.fillStyle = "#5C6890";
  ctx.fillText(label, W / 2, H / 2 + 90);

  // progress bar
  const bw = 360;
  ctx.fillStyle = "rgba(124,144,255,0.18)";
  ctx.fillRect(W / 2 - bw / 2, H / 2 + 118, bw, 3);
  ctx.fillStyle = "#6EE7A8";
  ctx.fillRect(W / 2 - bw / 2, H / 2 + 118, bw * progress, 3);
  ctx.textAlign = "left";
}
