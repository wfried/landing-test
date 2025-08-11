import { cookies } from "next/headers";
import PriceIntent from "@/components/PriceIntent";

export const runtime = 'edge';

export default async function ThankYou() {
  // Compute canonical variant/price on the server
  const jar = await cookies();
  const variant = (jar.get("ab_variant")?.value as "a" | "b" | undefined) || "a";
  const price = variant === "a"
    ? Number(process.env.PRICE_VARIANT_A || 9)
    : Number(process.env.PRICE_VARIANT_B || 15);

  return (
    <main className="px-6 sm:px-8 py-20 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">You’re on the list ✅</h1>
      <p className="mt-3 text-slate-700">We’ll email you as soon as alerts go live.</p>
      <div className="mt-8 rounded-xl border border-slate-200 p-6 bg-white">
        <p className="text-lg text-slate-900">Instant alerts will be <strong>€{price}/week</strong> (or €15 for all Paris attractions).</p>
        <p className="mt-2 text-slate-700">Would you pay for this for your trip?</p>
        <PriceIntent price={price} />
      </div>
    </main>
  );
}


