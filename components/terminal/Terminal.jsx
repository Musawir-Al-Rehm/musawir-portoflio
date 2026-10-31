"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Line, { Prompt } from "./Line";
import Matrix from "./Matrix";
import { CHAPTERS, CHIPS, CLOSE_STEPS, PAPER_STEPS, SEQUENCE, TIPS, flatten, resolveCommand } from "./script";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isFinePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
const t = (v) => ({ k: "text", v });

function Uptime() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const f = (n) => String(n).padStart(2, "0");
  return (
    <span>
      uptime {f(Math.floor(s / 3600))}:{f(Math.floor(s / 60) % 60)}:{f(s % 60)}
    </span>
  );
}

// Rotating hint in the status bar.
function TipTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % TIPS.length), 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <span key={i} className="term-tip">
      <span className="ty">›</span> {TIPS[i]}
    </span>
  );
}

/**
 * Full-screen terminal.
 * active          – true once it's visible; starts the autoplay
 * onClose(reason) – after the shutdown lines; reason "paper" means "take them to the notepad"
 * onAction(name)  – things that happen outside the screen ("lights")
 */
export default function Terminal({ active, onClose, onAction, night }) {
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState(null); // command currently being typed
  const [mode, setMode] = useState("auto"); // auto | input | busy | closing
  const [chapter, setChapter] = useState(0);
  const [input, setInput] = useState("");
  const [following, setFollowing] = useState(true);
  const [matrix, setMatrix] = useState(false);

  const idRef = useRef(0);
  const runRef = useRef(null); // { alive } of whatever is printing now
  const modeRef = useRef(mode);
  const scroller = useRef(null);
  const stick = useRef(true);
  const inputRef = useRef(null);
  const history = useRef({ list: [], i: 0 });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  const stopMatrix = useCallback(() => setMatrix(false), []);

  const push = useCallback((line) => {
    const id = ++idRef.current;
    setLines((prev) => [...prev, { ...line, id }]);
    if (line.k === "section") setChapter(line.n);
  }, []);

  // Plays a list of steps. `speed` < 1 is faster. Stops if token.alive turns false.
  const run = useCallback(
    async (steps, speed, token) => {
      for (const s of steps) {
        if (!token.alive) return false;
        if (s.t === "wait") {
          await sleep(s.ms * speed);
        } else if (s.t === "section") {
          push({ k: "section", n: s.n, total: s.total, title: s.title });
          await sleep(420 * speed);
        } else if (s.t === "cmd") {
          for (let i = 1; i <= s.text.length; i++) {
            if (!token.alive) return false;
            setTyping(s.text.slice(0, i));
            await sleep((28 + Math.random() * 46) * speed);
          }
          await sleep(260 * speed);
          if (!token.alive) return false;
          setTyping(null);
          push({ k: "cmd", v: s.text });
          await sleep(200 * speed);
        } else if (s.t === "out") {
          for (const line of s.lines) {
            if (!token.alive) return false;
            push(line);
            await sleep((line.delay ?? s.gap ?? 60) * speed);
          }
        }
      }
      return token.alive;
    },
    [push]
  );

  // Autoplay once the terminal is on screen.
  useEffect(() => {
    if (!active) return;
    const token = { alive: true };
    runRef.current = token;
    (async () => {
      await sleep(350);
      const done = await run(SEQUENCE, 1, token);
      if (done) setMode("input");
    })();
    return () => {
      token.alive = false;
    };
  }, [active, run]);

  // Keep the newest line in view, unless the reader has scrolled up.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [lines, typing, mode]);

  const onScroll = () => {
    const el = scroller.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stick.current = atBottom;
    setFollowing(atBottom);
  };

  const jumpToLive = () => {
    stick.current = true;
    setFollowing(true);
    const el = scroller.current;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const skip = useCallback(() => {
    if (modeRef.current !== "auto") return;
    if (runRef.current) runRef.current.alive = false;
    setTyping(null);
    setLines(flatten(SEQUENCE).map((l) => ({ ...l, id: ++idRef.current })));
    setChapter(CHAPTERS.length);
    stick.current = true;
    setMode("input");
  }, []);

  // Prints some last lines, then hands back to the 3D scene.
  const leave = useCallback(
    async (steps, reason) => {
      if (modeRef.current === "closing") return;
      if (runRef.current) runRef.current.alive = false;
      modeRef.current = "closing";
      setMode("closing");
      setTyping(null);
      stick.current = true;
      const token = { alive: true };
      runRef.current = token;
      await run(steps, 0.55, token);
      await sleep(350);
      onClose?.(reason);
    },
    [run, onClose]
  );
  const shutdown = useCallback(() => leave(CLOSE_STEPS), [leave]);

  const submit = useCallback(
    async (raw) => {
      if (modeRef.current !== "input") return;
      const text = raw.trim();
      setInput("");
      stick.current = true;
      push({ k: "cmd", v: text });
      if (!text) return;
      history.current.list.push(text);
      history.current.i = history.current.list.length;

      const res = resolveCommand(text);
      if (res.type === "clear") return setLines([]);
      if (res.type === "exit") return shutdown();
      if (res.type === "paper") return leave(PAPER_STEPS, "paper");
      if (res.type === "lights") {
        onAction?.("lights");
        push(t(night ? "{y}desk lamp:{/} off — back to daylight." : "{y}desk lamp:{/} on — you'll see it when you shut the laptop. 🌙"));
        return;
      }
      if (res.type === "matrix") {
        push(t("{g}wake up, neo…{/} {d}(click or wait to exit){/}"));
        setMatrix(true);
        return;
      }
      setMode("busy");
      const token = { alive: true };
      runRef.current = token;
      const ok = await run(res.steps, 0.45, token);
      if (ok) setMode("input");
    },
    [push, run, shutdown, leave, onAction, night]
  );

  // Keyboard: Enter skips the intro, Esc shuts down.
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "Escape") shutdown();
      else if (e.key === "Enter" && modeRef.current === "auto") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, shutdown, skip]);

  // Focus the prompt on desktop (on phones it would pop the keyboard up).
  useEffect(() => {
    if (mode === "input" && isFinePointer()) inputRef.current?.focus({ preventScroll: true });
  }, [mode]);

  const onKeyDown = (e) => {
    const h = history.current;
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "ArrowUp" && h.list.length) {
      e.preventDefault();
      h.i = Math.max(0, h.i - 1);
      setInput(h.list[h.i]);
    } else if (e.key === "ArrowDown" && h.list.length) {
      e.preventDefault();
      h.i = Math.min(h.list.length, h.i + 1);
      setInput(h.list[h.i] ?? "");
    }
  };

  const chapterTitle = chapter ? CHAPTERS[chapter - 1].title : "Boot";

  return (
    <div className="term" onClick={() => mode === "input" && isFinePointer() && inputRef.current?.focus({ preventScroll: true })}>
      <div className="term-grid" aria-hidden="true" />

      {/* title bar */}
      <header className="term-bar">
        <div className="term-dots">
          <button className="dot dot-r" onClick={(e) => (e.stopPropagation(), shutdown())} aria-label="Shut down and close the laptop" title="Shut down" />
          <span className="dot dot-y" />
          <span className="dot dot-g" />
        </div>
        <div className="term-title">
          <span className="tg">●</span> {"guest@musawir: ~ — secure shell"}
        </div>
        <div className="term-actions">
          {mode === "auto" && (
            <button onClick={(e) => (e.stopPropagation(), skip())} className="term-btn">
              skip ⏭
            </button>
          )}
          <button onClick={(e) => (e.stopPropagation(), shutdown())} className="term-btn term-btn-close">
            ✕ <span className="hide-sm">shut down</span>
          </button>
        </div>
      </header>

      {/* output */}
      <div ref={scroller} onScroll={onScroll} className="term-body" role="log" aria-live="polite">
        <div className="term-inner">
          {lines.map((l) => (
            <Line key={l.id} line={l} />
          ))}

          {typing !== null && (
            <div className="t-line t-cmd">
              <Prompt />
              <span className="tw">{typing}</span>
              <span className="caret" />
            </div>
          )}

          {mode === "input" && (
            <>
              <label className="t-line t-cmd t-input">
                <Prompt />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  placeholder="try: projects"
                  aria-label="Terminal command"
                />
              </label>
              <div className="t-chips">
                {CHIPS.map(([label, c]) => (
                  <button key={c} onClick={(e) => (e.stopPropagation(), submit(c))} data-kind={c}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {(mode === "auto" || mode === "busy" || mode === "closing") && typing === null && (
            <div className="t-line">
              <span className="caret" />
            </div>
          )}
        </div>
      </div>

      {!following && (
        <button onClick={jumpToLive} className="term-live">
          ↓ live
        </button>
      )}

      {/* status bar */}
      <footer className="term-status">
        <span>
          <span className="tg">◆</span> <span className="hide-sm">TLS 1.3 · AES-256-GCM</span>
          <span className="show-sm">secure</span>
        </span>
        <TipTicker />
        <span className="hide-sm">
          {String(chapter).padStart(2, "0")}/{String(CHAPTERS.length).padStart(2, "0")} · {chapterTitle.toLowerCase()} · <Uptime />
        </span>
      </footer>
      <div className="term-progress" style={{ transform: `scaleX(${chapter / CHAPTERS.length})` }} />

      {matrix && <Matrix onDone={stopMatrix} />}
      <div className="term-scan" aria-hidden="true" />
    </div>
  );
}