// Shared 3D state, read and written every frame (no React re-renders).
//
// k  : laptop   0 = closed, 1 = open and zoomed into the screen
// pk : notepad  0 = wide shot, 1 = camera looking down at the paper
// Each one moves towards its target, so closing is the opening played backwards.

export const LID_OPEN = -0.3; // radians: lid leaning back a little
export const LID_CLOSED = Math.PI / 2; // lid lying flat on the keyboard

// Where the notepad sits on the desk.
export const PAPER = { x: 2.9, y: -0.052, z: 0.45, rot: -0.1, w: 1.5, h: 2.1 };

export const story = {
  target: 0, // laptop: 0 = off, 1 = on
  k: 0,
  open: 0, // lid 0..1
  power: 0, // screen brightness 0..1
  zoom: 0, // camera: 0 = wide shot, 1 = screen fills the view

  paperTarget: 0,
  pk: 0,

  nightTarget: 0, // desk lamp on/off
  night: 0,

  plane: -1, // paper plane flight progress 0..1 (-1 = not flying)
};

export function resetStory() {
  Object.assign(story, {
    target: 0, k: 0, open: 0, power: 0, zoom: 0,
    paperTarget: 0, pk: 0, nightTarget: 0, night: 0, plane: -1,
  });
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);