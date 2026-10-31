import ExperienceLoader from "@/components/experience/ExperienceLoader";
import { contact, experience, layers, principles, profile, projects } from "@/lib/content";

export default function Home() {
  return (
    <>
      <ExperienceLoader />

      {/* Hidden text version of everything, for Google and screen readers */}
      <main className="sr-only">
        <h1>
          {profile.name} — {profile.role}
        </h1>
        <p>{profile.tagline}</p>
        {profile.about.map((p) => (
          <p key={p}>{p}</p>
        ))}

        <h2>Experience</h2>
        {experience.map((j) => (
          <section key={j.org}>
            <h3>
              {j.role}, {j.org} ({j.period})
            </h3>
            <p>{j.summary}</p>
            <ul>
              {j.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}

        <h2>Skills</h2>
        <ul>
          {layers.map((l) => (
            <li key={l.title}>
              {l.title}: {l.tags.join(", ")}
            </li>
          ))}
        </ul>

        <h2>Projects</h2>
        {projects.map((p) => (
          <section key={p.name}>
            <h3>
              {p.name} — {p.kind}
            </h3>
            <p>
              {p.problem} {p.text}
            </p>
          </section>
        ))}

        <h2>How I work</h2>
        <ul>
          {principles.map(([t, d]) => (
            <li key={t}>
              {t}: {d}
            </li>
          ))}
        </ul>

        <h2>Contact</h2>
        <p>
          <a href={`mailto:${contact.email}`}>{contact.email}</a> · {contact.phone}
        </p>
      </main>
    </>
  );
}