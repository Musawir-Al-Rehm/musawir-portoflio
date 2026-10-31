import { saveEnquiry } from "@/lib/enquiry";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// POST /api/enquiry  — receives a note written on the desk notepad.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Hidden "company" field: people never fill it, spam bots do.
  if (body?.company) return Response.json({ ok: true });

  const name = String(body?.name ?? "").trim().slice(0, 120);
  const email = String(body?.email ?? "").trim().slice(0, 200);
  const message = String(body?.message ?? "").trim().slice(0, 5000);

  if (!name) return Response.json({ ok: false, error: "Please sign with your name." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ ok: false, error: "That email doesn't look right." }, { status: 400 });
  if (message.length < 10) return Response.json({ ok: false, error: "Write a little more — a sentence or two." }, { status: 400 });

  const stored = await saveEnquiry({
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? "",
  });

  // No database yet: tell the page, so it can open the visitor's mail app instead.
  if (!stored) return Response.json({ ok: false, reason: "not_configured" });

  return Response.json({ ok: true });
}