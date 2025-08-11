import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { nanoid } from "nanoid";
import { z } from "zod";

// Simple in-memory rate limiter and origin check (per instance)
const ipHits: Map<string, number[]> = new Map();
async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  const xff = hdrs.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = hdrs.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}
async function isSameOrigin(): Promise<boolean> {
  const hdrs = await headers();
  const origin = hdrs.get("origin");
  const host = hdrs.get("host");
  if (!origin || !host) return true; // allow server-side or same-origin fetches with no origin
  try {
    const url = new URL(origin);
    return url.host === host;
  } catch {
    return false;
  }
}
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const arr = ipHits.get(key) || [];
  const recent = arr.filter((t) => t > windowStart);
  recent.push(now);
  ipHits.set(key, recent);
  return recent.length <= limit;
}

const LeadSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  attraction: z.enum(["Notre Dame", "Eiffel Tower", "Versailles", "Catacombs", "Other"]).optional(),
  variant: z.enum(["a", "b"]).optional(),
  priceAnchor: z.coerce.number().positive().optional(),
  _hp: z.string().optional(),
});

type LeadPayload = z.infer<typeof LeadSchema>;

export async function POST(req: Request) {
  const form = await req.formData();
  const raw = Object.fromEntries(form.entries());

  // CSRF: same-origin only
  if (!(await isSameOrigin())) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Rate limit per IP per route
  const ip = await getClientIp();
  if (!checkRateLimit(`lead:${ip}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // Validation
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  }
  const payload: LeadPayload = parsed.data;

  // basic honeypot
  if (payload["_hp"]) return NextResponse.json({ ok: true });

  const jar = await cookies();
  const utms: Record<string, string> = {};
  ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k => {
    const v = jar.get(k)?.value;
    if (v) utms[k] = v;
  });

  // Canonical variant from server cookie (avoid client tampering)
  const variantCookie = (jar.get("ab_variant")?.value as "a" | "b" | undefined);

  const body = {
    id: nanoid(),
    ts: new Date().toISOString(),
    type: "lead",
    ...payload,
    variant: variantCookie || payload.variant || "a",
    ip,
    utm: utms,
  };

  const url = process.env.LEAD_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
    } catch (e) {
      console.error("Webhook error", e);
    }
  } else {
    console.log("Lead (no webhook configured):", body);
  }

  return NextResponse.json({ ok: true });
}


