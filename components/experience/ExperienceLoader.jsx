"use client";

import dynamic from "next/dynamic";

// three.js only loads in the browser.
const Experience = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-ivory font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
      Loading…
    </div>
  ),
});

export default function ExperienceLoader() {
  return <Experience />;
}
