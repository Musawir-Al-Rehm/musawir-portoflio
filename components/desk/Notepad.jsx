"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/lib/content";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The paper on the desk, close up: a note to Musawir.
 * onCancel()      – back to the desk
 * onSent(mode)    – "sent" (saved by the API) or "mailto" (mail app opened instead)
 */
export default function Notepad({ visible, onCancel, onSent }) {
  const [form, setForm] = useState({ message: "", name: "", email: "", company: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | folding
  const [error, setError] = useState("");
  const messageRef = useRef(null);

  useEffect(() => {
    if (!visible || !window.matchMedia("(pointer: fine)").matches) return;
    const id = setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 450);
    return () => clearTimeout(id);
  }, [visible]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && status === "idle" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, status]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (message.length < 10) return setError("Write a little more — a sentence or two.");
    if (!name) return setError("Please sign with your name.");
    if (!EMAIL.test(email)) return setError("That email doesn't look right.");

    setStatus("sending");
    let mode = "sent";
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company: form.company }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400) {
        setError(data.error || "Please check your note.");
        setStatus("idle");
        return;
      }
      if (!res.ok || !data.ok) mode = "mailto";
    } catch {
      mode = "mailto";
    }

    if (mode === "mailto") {
      const subject = `A note from your portfolio — ${name}`;
      const body = `${message}\n\n— ${name}\n${email}`;
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    setStatus("folding");
    setTimeout(() => onSent(mode), 700);
  };

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="note-wrap" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}>
      <button className="note-backdrop" aria-label="Back to the desk" onClick={() => status === "idle" && onCancel()} />

      <form onSubmit={submit} className={`note-sheet ${status === "folding" ? "is-folding" : ""} ${visible ? "is-in" : ""}`} noValidate>
        <div className="note-date">{today}</div>
        <h2 className="note-hand note-title">Dear Musawir,</h2>

        <textarea
          ref={messageRef}
          className="note-hand note-lines"
          value={form.message}
          onChange={set("message")}
          placeholder="Tell me what you're building, what's slowing you down, or just say hello…"
          maxLength={5000}
          rows={7}
          aria-label="Your message"
        />

        <div className="note-sign">
          <label>
            <span>From</span>
            <input className="note-hand" value={form.name} onChange={set("name")} placeholder="your name" autoComplete="name" maxLength={120} />
          </label>
          <label>
            <span>Reply to</span>
            <input
              className="note-hand"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              autoComplete="email"
              maxLength={200}
            />
          </label>
          {/* spam trap: hidden from people */}
          <input className="note-trap" tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} aria-hidden="true" />
        </div>

        <p className="note-error note-hand" role="alert">
          {error}
        </p>

        <div className="note-actions">
          <button type="button" className="note-back" onClick={onCancel} disabled={status !== "idle"}>
            ← back to the desk
          </button>
          <button type="submit" className="note-send" disabled={status !== "idle"}>
            {status === "sending" ? "folding…" : "Fold & send ✈"}
          </button>
        </div>
      </form>
    </div>
  );
}
