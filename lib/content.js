// All site text lives here. Edit this file, not the components.

export const profile = {
  name: "Musawir Rehman",
  role: "Full-stack software engineer",
  focus: "Laravel / PHP · Next.js · Linux & VPS infrastructure",
  tagline: "I build business systems end to end — from the database schema and the server it runs on to the last frame of the interface.",
  location: "Multan, Pakistan (UTC+5) · working remotely with international teams",
  availability: "Open to project, contract and retained work",
  languages: "English · Urdu · Punjabi · Saraiki",
  about: [
    "Two years of hands-on production work building enterprise business systems in Laravel — CRM, HRM, LMS, ERP and financial modules — and owning the servers they run on: provisioning and hardening Linux VPS environments over SSH, configuring web servers, CI/CD and databases.",
    "On the front end I build with Next.js (App Router, TypeScript), React and a wide range of JavaScript libraries, from GSAP motion to Three.js and WebGL. Underneath sit MySQL, PostgreSQL or MongoDB, depending on how the data actually gets read.",
    "I also wire LLM APIs into real products, and I treat security as part of the build: validation, role-based access and hardened servers from the first commit, not after an audit. I ship end to end — schema, REST APIs, UI, deployment and performance tuning.",
  ],
};

export const contact = {
  email: "musawirrehman8@gmail.com",
  phone: "+92 323 6424910",
  // Replace "#" with your real links. Links left as "#" are hidden on the site.
  socials: [
    { label: "GitHub", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
};

// Work history, newest first.
export const experience = [
  {
    role: "Full Stack Engineer",
    org: "Conjoint Media",
    period: "Sep 2025 — Present",
    summary: "Architecting and running the company's modular business platforms in Laravel and MySQL — and the servers underneath them.",
    points: [
      "CRM and sales / lead pipelines, HRM with payroll, attendance and shift planning",
      "LMS and ERP modules sharing one role-based platform",
      "Real-time chat modules on Laravel Reverb (WebSockets), with a query-management workflow",
      "Email deliverability modules: queued transactional mail, with SPF, DKIM and DMARC set up on the sending domains",
      "Order and milestone-payment management, plus accounting features such as monthly profit / loss statements consolidating income, expenses, salaries, loans and provident fund",
      "Role-based permission layers and role-specific dashboards",
      "Production Linux VPS servers run entirely over SSH: virtual hosts, SSL, DNS, mail, deployments, monitoring",
      "Security audits and fixes: input validation, secure auth, permission checks, server hardening",
      "CI/CD pipelines that automate build, test and deploy; MySQL schema and query tuning",
    ],
    stack: ["Laravel", "PHP", "MySQL", "Reverb", "RBAC", "AlmaLinux", "OpenLiteSpeed", "CI/CD"],
  },
  {
    role: "Full Stack Web Developer",
    org: "Freelance — remote, international clients",
    period: "2024 — Present",
    summary: "Production websites and web apps delivered end to end.",
    points: [
      "Next.js (App Router, TypeScript) sites and apps with animation, 3D / WebGL and data visualisation",
      "Relational (PostgreSQL, MySQL) and NoSQL (MongoDB) data layers behind Node.js REST APIs",
      "Deployed on Vercel and VPS hosting, with LLM APIs powering AI-assisted features",
    ],
    stack: ["Next.js", "TypeScript", "React", "Node.js", "PostgreSQL", "MongoDB", "Three.js", "Vercel"],
  },
  {
    role: "Video Editor & Content Designer",
    org: "Brainix Solutions",
    period: "Sep 2021 — Dec 2022",
    summary: "Where the eye for motion started.",
    points: [
      "Advertising videos, motion graphics and VFX for client campaigns, delivered on deadline with clients directly",
    ],
    stack: ["Premiere Pro", "Photoshop", "Illustrator"],
  },
];

// The layers of the stack (used by the skills scan in the terminal).
export const layers = [
  {
    title: "Interface",
    port: "3000",
    tags: ["Next.js 14", "React", "TypeScript", "JavaScript", "Angular", "Tailwind CSS", "Bootstrap", "GSAP", "Three.js / WebGL"],
  },
  {
    title: "Backend & APIs",
    port: "8080",
    tags: ["PHP", "Laravel", "Eloquent", "Queues & events", "Reverb / WebSockets", "Node.js", "REST APIs"],
  },
  {
    title: "Data",
    port: "3306",
    tags: ["MySQL", "PostgreSQL", "MongoDB", "Schema design", "Indexing", "Query optimisation"],
  },
  {
    title: "Server & DevOps",
    port: "443",
    tags: ["AlmaLinux", "SSH", "OpenLiteSpeed", "Nginx", "Apache", "CyberPanel", "SSL", "DNS", "Mail servers", "CI/CD", "Git"],
  },
  {
    title: "Security",
    port: "22",
    tags: ["OWASP Top 10", "SQLi / XSS / CSRF", "Auth & RBAC", "Input validation", "SSH hardening", "Firewalls"],
  },
  {
    title: "AI & LLMs",
    port: "11434",
    tags: ["LLM APIs", "Prompt engineering", "AI-assisted automation"],
  },
];

// Each project's link opens in a new tab. Leave `url` empty to hide the link.
export const projects = [
  {
    name: "Conjoint Media CRM",
    kind: "Enterprise suite · Laravel",
    problem: "HR, sales, finance, learning and team chat spread across separate tools.",
    text: "One Laravel platform covering CRM and lead pipelines, HRM with payroll and shift planning, LMS and ERP modules, order and milestone payments, monthly profit / loss reporting, real-time chat and email deliverability — behind role-based access, on Linux servers I run. The link opens its secure login portal.",
    tags: ["Laravel", "PHP", "MySQL", "Reverb", "RBAC", "Linux VPS"],
    url: "https://conjointmedia.cloud",
  },
  {
    name: "Radix Solutions",
    kind: "US IT company · Next.js",
    problem: "A remote-first IT company needed to look as capable as the work it sells.",
    text: "Website for an Arizona-based IT company serving US businesses: services from web and app development to AI automation and CRM, an interactive globe marking client locations, animated product mock-ups, a scroll-driven four-step process and a quote request flow.",
    tags: ["Next.js", "React", "Node.js", "PostgreSQL"],
    url: "https://www.radixsolutions.cloud",
  },
  {
    name: "Career Sponsorship",
    kind: "UK recruitment & careers · Next.js",
    problem: "International graduates in the UK struggle to reach employers who can sponsor them.",
    text: "Site for a Wolverhampton careers firm helping international students and graduates land roles with licensed sponsors: CV, cover letter, LinkedIn and interview services, pricing, reviews, a step-by-step route section, FAQs, WhatsApp and newsletter sign-up.",
    tags: ["Next.js", "React", "Node.js", "PostgreSQL"],
    url: "https://www.careersponsorship.uk/home",
  },
  {
    name: "Nintex Software",
    kind: "UK software firm · Next.js",
    problem: "A UK software house needed a site that wins clients and lets them in.",
    text: "Marketing site for a Wolverhampton software company — services, a six-step delivery process, reviews, FAQs and a consultation flow — plus a separate authenticated access area.",
    tags: ["Next.js", "React", "PostgreSQL", "Auth"],
    url: "https://nintexsoftwaresltd-aawrdi57y-musawir-al-rehms-projects.vercel.app/home",
  },
  {
    name: "The Ark Agency",
    kind: "Agency platform · AU · Next.js",
    problem: "Listings, agents and enquiries were managed in separate places.",
    text: "A multi-page platform for a New South Wales agency: browsable listings, agent profiles, services, enquiry routing, and a login-protected area for the team to add new listings.",
    tags: ["Next.js", "React", "PostgreSQL", "Auth"],
    url: "https://realestatedemo-bqesnkmpg-musawir-al-rehms-projects.vercel.app/home",
  },
  {
    name: "Boost My Grades",
    kind: "UK academic services · WordPress",
    problem: "A service business with dozens of offerings needed every one to be findable and orderable.",
    text: "A WordPress site built properly: service and city pages, a pricing grid by level and deadline, an order flow with card and PayPal payments, writer profiles, reviews, FAQs and live chat.",
    tags: ["WordPress", "PHP", "MySQL", "SEO"],
    url: "https://boostmygrades.uk",
  },
  {
    name: "Usman Tahir",
    kind: "Developer portfolio",
    problem: "A developer portfolio that had to load fast and still feel considered.",
    text: "A personal portfolio for a software engineer, built around a clean editorial layout and smooth, lightweight motion.",
    tags: ["React", "GSAP", "Tailwind"],
    url: "https://usmantahir.me",
  },
  {
    name: "musawirrehman.site",
    kind: "Personal platform",
    problem: "A portfolio should feel like sitting at my desk, not scrolling a template.",
    text: "This site: a 3D desk built entirely in code with Three.js, a terminal that types the story and understands plain-language commands, and a notepad that sends enquiries — with rendering paused whenever the 3D is hidden.",
    tags: ["Next.js", "React Three Fiber", "Three.js", "API routes"],
    url: "https://musawirrehman.site",
  },
];

export const principles = [
  ["Problem first", "Understand the business process, then build the smallest system that fixes it."],
  ["Secure by default", "Validation, least-privilege roles and hardened servers from the first commit — not after an audit."],
  ["Performance budget", "Set on day one and held to — interfaces that hold up on mid-range hardware."],
  ["Own the whole stack", "Schema, API, UI, server and deploy — one person accountable from end to end."],
  ["Clean handover", "Documentation your team can pick up without me in the room."],
]