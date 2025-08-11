"use client";
import { useState } from "react";

const ATTRACTIONS = ["Notre Dame", "Eiffel Tower", "Versailles", "Catacombs", "Other"] as const;

type Props = { variant: "a" | "b"; price: number };

export default function LeadForm({ variant, price }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErr(null);
    setSubmitting(true);
    const form = event.currentTarget;
    const fd = new FormData(form);
    fd.append("variant", variant);
    fd.append("priceAnchor", String(price));

    try {
      const res = await fetch("/api/lead", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      window.location.href = `/thank-you`;
    } catch (e) {
      setErr("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="signup" className="px-6 sm:px-8 py-12 sm:py-16 max-w-xl mx-auto">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Get Instant Alerts</h3>
        <p className="mt-1 text-slate-600">We’ll email you the moment tickets appear.</p>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">First name</label>
            <input name="firstName" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Which attractions?</label>
            <select name="attraction" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {ATTRACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {/* Honeypot */}
          <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />
          <button disabled={submitting} className="mt-2 rounded-lg bg-slate-900 text-white px-5 py-3 font-medium hover:opacity-90 disabled:opacity-60">
            {submitting ? "Submitting…" : `Get Alerts — from €${price}/week`}
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <p className="text-xs text-slate-500 mt-2">No spam. Unsubscribe anytime.</p>
        </div>
      </form>
    </section>
  );
}


