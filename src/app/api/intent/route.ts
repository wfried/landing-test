import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { cookies, headers } from "next/headers";

// Simple in-memory limiter (per instance)
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
  if (!origin || !host) return true;
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

const IntentSchema = z.object({
  willPay: z.coerce.boolean(),
});

export async function POST(req: Request) {
  // CSRF: same-origin only
  if (!(await isSameOrigin())) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Rate limit
  const ip = await getClientIp();
  if (!checkRateLimit(`intent:${ip}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = IntentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { willPay } = parsed.data;

  // Canonical variant and price from server
  const jar = await cookies();
  const variant = (jar.get("ab_variant")?.value as "a" | "b" | undefined) || "a";
  const price = variant === "a"
    ? Number(process.env.PRICE_VARIANT_A || 9)
    : Number(process.env.PRICE_VARIANT_B || 15);
  const body = {
    id: nanoid(),
    ts: new Date().toISOString(),
    type: "intent",
    variant,
    price,
    willPay,
    ip,
  };

  const url = process.env.LEAD_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
    } catch (e) {
      console.error("Webhook error", e);
    }
  } else {
    console.log("Intent (no webhook configured):", body);
  }

  return NextResponse.json({ ok: true });
}


