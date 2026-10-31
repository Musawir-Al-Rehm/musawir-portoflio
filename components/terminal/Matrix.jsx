"use client";

import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789{}<>/=;$#".split("");

// Digital rain over the terminal for a few seconds. Click to stop early.
export default function Matrix({ onDone, seconds = 6 }) {
  const canvas = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const size = 16;
    const cols = Math.ceil(c.clientWidth / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    let raf;
    let last = 0;
    const start = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 45) return;
      last = now;
      ctx.fillStyle = "rgba(5, 10, 28, 0.14)";
      ctx.fillRect(0, 0, c.clientWidth, c.clientHeight);
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        const ch = CHARS[(Math.random() * CHARS.length) | 0];
        ctx.fillStyle = Math.random() > 0.96 ? "#F1F4FF" : i % 3 ? "#6EE7A8" : "#67E8F9";
        ctx.fillText(ch, i * size, y * size);
        drops[i] = y * size > c.clientHeight && Math.random() > 0.975 ? 0 : y + 1;
      });
      if (now - start > seconds * 1000) onDone();
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [onDone, seconds]);

  return <canvas ref={canvas} className="term-matrix" onClick={onDone} aria-hidden="true" />;
}