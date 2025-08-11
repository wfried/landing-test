"use server";
import { cookies, headers } from "next/headers";

const UTM_KEYS = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"] as const;

export async function persistUtmFromRequest(): Promise<boolean> {
  const jar = await cookies();
  const hdrs = await headers();
  const url = new URL(hdrs.get("x-url") || "http://local/");
  let changed = false;
  for (const key of UTM_KEYS) {
    const val = url.searchParams.get(key);
    if (val && !jar.get(key)) {
      jar.set(key, val, { path: "/", maxAge: 60*24*3600 });
      changed = true;
    }
  }
  return changed;
}

export async function readUtmCookies(): Promise<Record<string,string>> {
  const jar = await cookies();
  const out: Record<string,string> = {};
  for (const k of UTM_KEYS) {
    const v = jar.get(k)?.value;
    if (v) out[k] = v;
  }
  return out;
}


