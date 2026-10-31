// Everything the terminal types, in order.
//
// A "step" is one of:
//   { t: "cmd", text }            a command typed letter by letter, then Enter
//   { t: "out", lines, gap }      output lines printed one after another
//   { t: "wait", ms }             a pause
//   { t: "section", n, title }    a chapter divider
//
// Text lines use small colour tags:  {g}green{/} {b}blue{/} {y}amber{/} {r}red{/}
// {c}cyan{/} {w}white{/} {d}dim{/}

import { experience, layers, principles, profile, projects } from "@/lib/content";

const t = (v, delay) => ({ k: "text", v, delay });
const blank = (delay = 40) => ({ k: "blank", delay });
const cmd = (text) => ({ t: "cmd", text });
const out = (lines, gap) => ({ t: "out", lines, gap });
// Time to read a piece of text before the next line appears.
const read = (s) => Math.max(500, s.length * 19);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const PROMPT_USER = "guest@musawir";

/* ---------------- boot ---------------- */

export const BOOT = [
  { t: "wait", ms: 300 },
  out(
    [
      t("{d}[    0.000000]{/} musawir-os 6.2.0-secure — booting"),
      t("{d}[    0.004211]{/} cpu0: full-stack · layers: interface api data devops security ai"),
      t("{g}[  OK  ]{/} Mounted {w}/home/musawir{/}"),
      t("{g}[  OK  ]{/} Started network interface {d}eth0 — connected{/}"),
      t("{y}[ .... ]{/} Establishing encrypted tunnel {d}TLS 1.3 · AES-256-GCM{/}", 420),
      t("{g}[  OK  ]{/} Handshake verified {d}fingerprint 4f:2a:9c:e1:7b:03:d8:5a{/}"),
      { k: "progress", label: "Decrypting profile", delay: 1250 },
      t("{g}[  OK  ]{/} Identity confirmed"),
      blank(),
      { k: "granted", delay: 800 },
      blank(),
      { k: "banner", delay: 600 },
      t(`{w}${profile.role}{/} {d}—{/} {b}${profile.focus}{/}`, 120),
      t(`{d}${profile.tagline}{/}`),
      blank(),
      { k: "tips", delay: 1200 },
    ],
    90
  ),
];

/* ---------------- chapters ---------------- */

const about = [
  cmd("whoami"),
  out([t(`{w}${slug(profile.name)}{/}`)]),
  cmd("cat about.md"),
  out(profile.about.map((p) => ({ k: "para", v: p, delay: read(p) }))),
  out(
    [
      blank(),
      t(`{d}location {/}  ${profile.location}`),
      t(`{d}speaks   {/}  ${profile.languages}`),
      t(`{d}status   {/}  {g}●{/} ${profile.availability}`),
    ],
    120
  ),
];

const work = [
  cmd("./experience --verbose"),
  out([t(`{d}reading work history…{/} {g}${experience.length} records found{/}`, 350)]),
  out(experience.map((job) => ({ k: "job", job, delay: 2000 + job.points.length * 380 }))),
];

const skills = [
  cmd("nmap -sV stack.musawir.dev"),
  out(
    [
      t(`{d}Starting Nmap 7.94 — scanning ${layers.length} layers…{/}`, 650),
      { k: "porthead" },
      ...layers.map((l) => ({ k: "port", port: l.port, service: l.title, versions: l.tags, delay: 260 })),
      t(`{d}Nmap done:{/} 1 host up {d}·{/} {g}${layers.length} open ports{/} {d}·{/} 0 vulnerabilities {d}· scanned in 0.42s{/}`),
    ],
    90
  ),
];

const portfolio = [
  cmd("ls -la ~/projects"),
  out(
    [t(`{d}total ${projects.length}{/}`), ...projects.map((p) => ({ k: "dir", name: slug(p.name), kind: p.kind }))],
    70
  ),
  cmd("cat ~/projects/*/README.md"),
  out(projects.map((p, i) => ({ k: "project", p, i, delay: 1100 + read(p.text) * 0.6 }))),
];

const values = [
  cmd("cat principles.txt"),
  out(principles.map(([title, text], i) => ({ k: "principle", title, text, i, delay: 300 + read(text) * 0.6 }))),
];

const hire = [
  cmd("ssh hire@musawir.dev"),
  out(
    [
      t("{d}Connecting to musawir.dev port 22…{/}", 500),
      t("{g}Authenticated.{/} Secure channel open.", 300),
      blank(),
      { k: "contact", delay: 500 },
      blank(),
      t("{w}Have something worth building?{/}"),
      t("{d}Send a short description of the problem and what it's costing you now. I'll tell you whether it's worth building, and what the smallest first version looks like.{/}", 900),
      blank(),
      t("{y}✎{/} prefer pen and paper? type {y}contact{/} and I'll walk you to the notepad on the desk."),
    ],
    120
  ),
];

export const CHAPTERS = [
  { id: "about", title: "About", steps: about },
  { id: "experience", title: "Experience", steps: work },
  { id: "skills", title: "Stack scan", steps: skills },
  { id: "projects", title: "Projects", steps: portfolio },
  { id: "principles", title: "How I work", steps: values },
  { id: "details", title: "Contact", steps: hire },
];

export const END = [
  out([blank(200), t("{g}●{/} session ready — type {y}help{/}, or just ask: {y}projects{/}, {y}who are you{/}, {y}contact{/}…")]),
];

// The whole autoplay, start to finish.
export const SEQUENCE = [
  ...BOOT,
  ...CHAPTERS.flatMap((c, i) => [{ t: "section", n: i + 1, total: CHAPTERS.length, title: c.title }, ...c.steps]),
  ...END,
];

export const CLOSE_STEPS = [
  cmd("shutdown -h now"),
  out(
    [
      t("{y}Broadcast message:{/} the system is going down {r}NOW{/}"),
      t("{d}saving session… done{/}"),
      t("{d}Connection to musawir.dev closed.{/}"),
    ],
    160
  ),
];

export const PAPER_STEPS = [
  out(
    [
      t("{y}✎{/} opening the notepad on the desk…", 300),
      t("{d}closing this session so you can write — see you on paper.{/}", 500),
    ],
    200
  ),
];

/* ---------------- typed commands ---------------- */

// Buttons under the prompt: [label, command]
export const CHIPS = [
  ["help", "help"],
  ["about", "about"],
  ["experience", "experience"],
  ["skills", "skills"],
  ["projects", "projects"],
  ["✎ write a note", "contact"],
  ["exit", "exit"],
];

// Rotating hints in the status bar.
export const TIPS = [
  "try: projects",
  "try: who are you",
  "try: contact → write me a note on the desk",
  "try: skills",
  "try: security",
  "try: lms or erp",
  "try: experience",
  "try: lights",
  "try: matrix",
  "try: sudo hire musawir",
];

const HELP = [
  out([
    {
      k: "help",
      rows: [
        ["about", "who I am — also: intro, bio, who are you"],
        ["experience", "where I've worked — also: cv, lms, erp, crm"],
        ["skills", "scan the stack — also: stack, security, devops"],
        ["projects", "selected work — also: portfolio, work, apps"],
        ["principles", "how I work — also: process, values"],
        ["contact", "write me a note on the desk ✎"],
        ["email", "my email, phone and links"],
        ["lights", "switch the desk lamp"],
        ["matrix", "you know what this does"],
        ["clear", "clear the screen"],
        ["exit", "shut the laptop"],
      ],
    },
  ]),
];

// Every word a visitor might type, mapped to what it should show.
const ALIASES = {
  help: "help", "?": "help", commands: "help", menu: "help",
  ls: "ls", dir: "ls",
  about: "about", whoami: "about", who: "about", intro: "about", introduction: "about", bio: "about",
  profile: "about", yourself: "about", me: "about", musawir: "about", hello: "hello", hi: "hello", hey: "hello",
  experience: "experience", exp: "experience", career: "experience", cv: "experience", resume: "experience",
  jobs: "experience", job: "experience", history: "experience", employment: "experience",
  skills: "skills", skill: "skills", stack: "skills", tech: "skills", technologies: "skills",
  tools: "skills", toolkit: "skills", languages: "skills", nmap: "skills", scan: "skills",
  security: "skills", secure: "skills", owasp: "skills", devops: "skills", server: "skills", servers: "skills",
  linux: "skills", vps: "skills", laravel: "skills", php: "skills", nextjs: "skills", react: "skills",
  lms: "experience", erp: "experience", crm: "experience", hrm: "experience", chat: "experience",
  deliverability: "experience", payroll: "experience", enterprise: "experience",
  projects: "projects", project: "projects", portfolio: "projects", work: "projects", apps: "projects",
  sites: "projects", websites: "projects", clients: "projects", built: "projects", showcase: "projects",
  principles: "principles", values: "principles", process: "principles", approach: "principles",
  contact: "paper", write: "paper", note: "paper", letter: "paper", enquiry: "paper", inquiry: "paper",
  message: "paper", hire: "paper", quote: "paper", reach: "paper", paper: "paper", notepad: "paper",
  email: "details", mail: "details", phone: "details", call: "details", details: "details",
  socials: "details", links: "details", ssh: "details",
  banner: "banner", logo: "banner",
  clear: "clear", cls: "clear",
  lights: "lights", lamp: "lights", light: "lights", night: "lights", dark: "lights",
  matrix: "matrix", coffee: "coffee", tea: "coffee",
  exit: "exit", logout: "exit", quit: "exit", shutdown: "exit", close: "exit", bye: "exit",
};
const KEYS = Object.keys(ALIASES);
const WEAK = new Set(["me", "who", "hi", "hey", "hello", "musawir", "yourself", "work", "dark", "call"]);

// Allow small typos: "projcts", "experiance", "skils".
function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
function match(word) {
  if (ALIASES[word]) return ALIASES[word];
  if (word.length < 4) return null;
  const limit = word.length >= 7 ? 2 : 1;
  let best = null;
  let bestD = limit + 1;
  for (const k of KEYS) {
    if (k.length < 4) continue;
    const d = distance(word, k);
    if (d < bestD) [best, bestD] = [ALIASES[k], d];
  }
  return best;
}

const clean = (s) => s.replace(/[{}]/g, "");
const chapterSteps = (id, n) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return [{ t: "section", n: i + 1, total: CHAPTERS.length, title: CHAPTERS[i].title }, ...CHAPTERS[i].steps].slice(n);
};

const COFFEE = [
  "{y}      ( (    {/}",
  "{y}       ) )   {/}",
  "{w}    ........ {/}",
  "{w}    |      |]{/}  {d}brewing… done.{/}",
  "{w}    \\      / {/}  fuel for the next build ☕",
  "{w}     `----'  {/}",
];

export function resolveCommand(raw) {
  const input = raw.trim();
  const lower = input.toLowerCase();

  if (lower.startsWith("sudo")) {
    return {
      type: "steps",
      steps: [
        out([t("{d}[sudo] password for guest:{/} ********", 500), t("{g}access granted.{/} you clearly mean business.", 400)]),
        ...chapterSteps("details", 2),
      ],
    };
  }
  if (lower.startsWith("echo ")) return { type: "steps", steps: [out([t(clean(input.slice(5)))])] };
  if (lower === "date") return { type: "steps", steps: [out([t(new Date().toString())])] };
  if (/^rm\s/.test(lower)) return { type: "steps", steps: [out([t("{r}permission denied:{/} nice try.")])] };

  // Look at every word, so "show me your projects" or "who are you?" work too.
  const words = lower.replace(/[^a-z0-9?\s-]/g, " ").split(/\s+/).filter(Boolean);
  // Specific words win over vague ones ("show me your projects" → projects, not "me").
  let key = null;
  let hit = "";
  for (const pass of [false, true]) {
    for (const w of words) {
      const word = w.replace(/^\.\//, "").replace(/\.(md|txt)$/, "");
      if (WEAK.has(word) !== pass) continue;
      const m = match(word);
      if (m) {
        key = m;
        hit = word;
        break;
      }
    }
    if (key) break;
  }

  if (!key) {
    return {
      type: "steps",
      steps: [out([t(`{r}zsh: command not found:{/} ${clean(words[0] || input)} {d}— try{/} {y}help{/}`)])],
    };
  }

  // Tell people what we understood when it wasn't an exact command.
  const note = words.length > 1 || !ALIASES[hit] ? [out([t(`{d}→ showing{/} {y}${key === "paper" ? "contact" : key}{/}`)])] : [];

  switch (key) {
    case "clear":
      return { type: "clear" };
    case "exit":
      return { type: "exit" };
    case "paper":
      return { type: "paper" };
    case "lights":
      return { type: "lights" };
    case "matrix":
      return { type: "matrix" };
    case "help":
      return { type: "steps", steps: HELP };
    case "hello":
      return { type: "steps", steps: [out([t("{w}hey 👋{/} I'm Musawir. Type {y}about{/} for the intro, or {y}help{/} for everything.")])] };
    case "banner":
      return { type: "steps", steps: [out([{ k: "banner" }])] };
    case "coffee":
      return { type: "steps", steps: [out(COFFEE.map((l) => t(l)), 80)] };
    case "ls":
      return {
        type: "steps",
        steps: [out([t("{b}about.md{/}   {b}experience/{/}   {b}projects/{/}   {b}principles.txt{/}   {b}stack.scan{/}   {g}notepad.txt{/}")])],
      };
    case "details":
      return { type: "steps", steps: [...note, ...chapterSteps("details", 2)] };
    default:
      // Replays the whole chapter, typed commands and all.
      return { type: "steps", steps: [...note, ...chapterSteps(key, 0)] };
  }
}

// Every line of the autoplay at once (used by "skip").
export function flatten(steps) {
  const lines = [];
  for (const s of steps) {
    if (s.t === "cmd") lines.push({ k: "cmd", v: s.text });
    else if (s.t === "out") lines.push(...s.lines);
    else if (s.t === "section") lines.push({ k: "section", n: s.n, total: s.total, title: s.title });
  }
  return lines;
}