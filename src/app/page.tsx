import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import LeadForm from "@/components/LeadForm";
import { persistUtmFromRequest } from "@/lib/utm";
import { cookies, headers } from "next/headers";

export const runtime = 'edge';

async function pickVariant(): Promise<"a" | "b"> {
  const hdrs = await headers();
  const url = new URL(hdrs.get("x-url") || "http://local/");
  const qv = (url.searchParams.get("variant") || "").toLowerCase();
  if (qv === "a" || qv === "b") return qv;
  const jar = await cookies();
  const existing = jar.get("ab_variant")?.value as "a" | "b" | undefined;
  if (existing) return existing;
  const v = Math.random() < 0.5 ? "a" : "b";
  (await cookies()).set("ab_variant", v, { path: "/", maxAge: 60 * 24 * 3600 });
  return v;
}

export default async function Home() {
  await persistUtmFromRequest();
  const variant = await pickVariant();
  const price = variant === "a" ? Number(process.env.PRICE_VARIANT_A || 9) : Number(process.env.PRICE_VARIANT_B || 15);

  return (
    <main>
      <Hero variant={variant} price={price} />
      <SocialProof />
      <HowItWorks />
      <LeadForm variant={variant} price={price} />
      <footer className="px-6 sm:px-8 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Paris Alerts · <a className="hover:underline" href="#">Privacy</a>
      </footer>
    </main>
  );
}
