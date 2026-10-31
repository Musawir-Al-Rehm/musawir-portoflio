import { memo } from "react";
import { BANNER } from "./banner";
import { PROMPT_USER } from "./script";
import { contact } from "@/lib/content";

const TAGS = { g: "tg", b: "tb", y: "ty", r: "tr", c: "tc", w: "tw", d: "td" };

// Turns "{g}OK{/} done" into coloured spans.
export function Markup({ v }) {
  const parts = [];
  const re = /\{(\w)\}|\{\/\}/g;
  let cls = "";
  let last = 0;
  let m;
  while ((m = re.exec(v))) {
    if (m.index > last) parts.push([v.slice(last, m.index), cls]);
    cls = m[1] ? TAGS[m[1]] || "" : "";
    last = re.lastIndex;
  }
  if (last < v.length) parts.push([v.slice(last), cls]);
  return parts.map(([text, c], i) => (
    <span key={i} className={c || undefined}>
      {text}
    </span>
  ));
}

export function Prompt() {
  return (
    <span className="t-prompt">
      <span className="tg">{PROMPT_USER}</span>
      <span className="td">:</span>
      <span className="tb">~</span>
      <span className="td">$</span>{" "}
    </span>
  );
}

const pad = (n) => String(n).padStart(2, "0");

// "https://www.radixsolutions.cloud" → "radixsolutions.cloud"; long Vercel addresses → "live site"
function linkLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.endsWith("vercel.app") ? "live site" : host;
  } catch {
    return "open";
  }
}
const links = () => [
  { label: "email", value: contact.email, href: `mailto:${contact.email}` },
  { label: "phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
  ...contact.socials
    .filter((s) => s.href && s.href !== "#")
    .map((s) => ({ label: s.label.toLowerCase(), value: s.href.replace(/^https?:\/\/(www\.)?/, ""), href: s.href })),
];

function Line({ line }) {
  switch (line.k) {
    case "cmd":
      return (
        <div className="t-line t-cmd">
          <Prompt />
          <span className="tw">{line.v}</span>
        </div>
      );

    case "text":
      return (
        <div className="t-line">
          <Markup v={line.v} />
        </div>
      );

    case "para":
      return <p className="t-line t-para">{line.v}</p>;

    case "blank":
      return <div className="t-blank" />;

    case "progress":
      return (
        <div className="t-line t-progress">
          <span className="ty">[ .... ]</span> {line.label}{" "}
          <span className="t-bar">
            <span />
          </span>{" "}
          <span className="tg t-pct">100%</span>
        </div>
      );

    case "granted":
      return (
        <div className="t-line t-granted glitch" data-text="ACCESS GRANTED">
          ACCESS GRANTED
        </div>
      );

    case "banner":
      return (
        <pre className="t-banner" aria-label="Musawir">
          {BANNER}
        </pre>
      );

    case "section":
      return (
        <div className="t-section">
          <span className="td">──</span>
          <span className="tb">
            [ {pad(line.n)} / {pad(line.total)} ]
          </span>
          <span className="glitch tw" data-text={line.title.toUpperCase()}>
            {line.title.toUpperCase()}
          </span>
          <span className="t-rule" />
        </div>
      );

    case "job": {
      const j = line.job;
      return (
        <div className="t-card">
          <div className="t-card-head">
            <span>
              <span className="tw">{j.role}</span> <span className="td">@</span> <span className="tb">{j.org}</span>
            </span>
            <span className="tg">{j.period}</span>
          </div>
          <p className="t-card-sub">{j.summary}</p>
          <ul className="t-list">
            {j.points.map((p) => (
              <li key={p}>
                <span className="tc">›</span> {p}
              </li>
            ))}
          </ul>
          <div className="t-tags">
            {j.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      );
    }

    case "porthead":
      return (
        <div className="t-port t-port-head td">
          <span>PORT</span>
          <span>STATE</span>
          <span>SERVICE</span>
          <span>VERSION</span>
        </div>
      );

    case "port":
      return (
        <div className="t-port">
          <span className="ty">{line.port}/tcp</span>
          <span className="tg">open</span>
          <span className="tw">{line.service}</span>
          <span className="t-versions">{line.versions.join(" · ")}</span>
        </div>
      );

    case "dir":
      return (
        <div className="t-line t-dir">
          <span className="td">drwxr-xr-x</span> <span className="td">musawir</span>{" "}
          <span className="tb">{line.name}/</span> <span className="td"># {line.kind.toLowerCase()}</span>
        </div>
      );

    case "project": {
      const p = line.p;
      return (
        <div className="t-card">
          <div className="t-card-head">
            <span>
              <span className="td">{pad(line.i + 1)}</span> <span className="tw t-big">{p.name}</span>
            </span>
            <span className="tc">{p.kind.toLowerCase()}</span>
          </div>
          <p className="t-card-sub">
            <span className="ty">problem </span> {p.problem}
          </p>
          <p className="t-para">{p.text}</p>
          <div className="t-tags">
            {p.tags.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="t-card-foot">
            <span>
              <span className="tg">●</span> <span className="td">status</span> deployed
            </span>
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="t-link" onClick={(e) => e.stopPropagation()}>
                {linkLabel(p.url)} ↗
              </a>
            )}
          </div>
        </div>
      );
    }

    case "principle":
      return (
        <div className="t-line t-principle">
          <span className="tb">{pad(line.i + 1)}</span>
          <span>
            <span className="tw">{line.title}</span> <span className="td">—</span> {line.text}
          </span>
        </div>
      );

    case "contact":
      return (
        <div className="t-contact">
          {links().map((l) => (
            <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              <span className="td">{l.label.padEnd(8, " ")}</span>
              <span className="t-link">{l.value}</span>
            </a>
          ))}
        </div>
      );

    case "tips":
      return (
        <div className="t-tips">
          <div className="t-tips-head">
            <span className="ty">tips</span> <span className="td">— type any of these, any time</span>
          </div>
          <div className="t-tips-grid">
            {[
              ["about", "who I am"],
              ["projects", "selected work"],
              ["skills", "the stack"],
              ["experience", "where I've worked"],
              ["contact", "✎ note on the desk"],
              ["help", "everything else"],
            ].map(([c, d]) => (
              <span key={c}>
                <span className="tw">{c}</span> <span className="td">{d}</span>
              </span>
            ))}
          </div>
          <div className="td t-tips-foot">
            <span className="ty">Enter</span> skips the intro · <span className="ty">Esc</span> or <span className="tr">✕</span> shuts the laptop
          </div>
        </div>
      );

    case "help":
      return (
        <div className="t-help">
          {line.rows.map(([c, d]) => (
            <div key={c}>
              <span className="ty">{c}</span>
              <span className="td">{d}</span>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export default memo(Line);