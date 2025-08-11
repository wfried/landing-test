"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Summary = {
  ok: boolean;
  leadsCount: number;
  intentsCount: number;
  leadsByVariant: Array<{ variant: string; n: number }>;
  intentAgg: Array<{ variant: string; yes: number; no: number }>;
  recentLeads: Array<{ ts: string; email: string; attraction: string; variant: string; utm_source?: string; utm_campaign?: string }>;
};

export default function AdminPage() {
  const [pwd, setPwd] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  const [data, setData] = useState<Summary | { ok: false } | null>(null);

  async function loadSummary(password: string) {
    const base = (process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL || "").replace(/\/$/, "");
    const res = await fetch(`${base}/admin/summary`, { headers: { Authorization: `Bearer ${password}` }, cache: "no-store" });
    if (!res.ok) {
      setData({ ok: false });
      return false;
    }
    const json = await res.json();
    setData(json);
    return true;
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("admin_pwd") : "";
    if (saved) {
      setPwd(saved);
      loadSummary(saved).then((ok) => setAuthed(ok));
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await loadSummary(pwd);
    setAuthed(ok);
    if (ok && typeof window !== "undefined") window.localStorage.setItem("admin_pwd", pwd);
  }
  return (
    <main className="px-6 sm:px-8 py-12 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
      {!authed ? (
        <form onSubmit={onSubmit} className="mt-6 max-w-sm">
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          <button className="mt-3 rounded-lg bg-slate-900 text-white px-5 py-2">Enter</button>
        </form>
      ) : !data?.ok ? (
        <p className="mt-4 text-slate-700">Could not load summary.</p>
      ) : (
        <div className="mt-6 grid gap-6">
          <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h2 className="font-medium text-slate-900">Totals</h2>
            <p className="mt-2 text-slate-700">Leads: <strong>{data.leadsCount}</strong> · Intents: <strong>{data.intentsCount}</strong></p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h2 className="font-medium text-slate-900">Leads by Variant</h2>
            <ul className="mt-2 text-slate-700 list-disc pl-5">
              {data.leadsByVariant?.map((r: { variant: string; n: number }) => (
                <li key={r.variant}>{r.variant || "(none)"}: {r.n}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h2 className="font-medium text-slate-900">Willingness to Pay</h2>
            <ul className="mt-2 text-slate-700 list-disc pl-5">
              {data.intentAgg?.map((r: { variant: string; yes: number; no: number }) => (
                <li key={r.variant}>{r.variant || "(none)"}: yes {r.yes} / no {r.no}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h2 className="font-medium text-slate-900">Recent Leads</h2>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-1">Time</th>
                  <th className="py-1">Email</th>
                  <th className="py-1">Attraction</th>
                  <th className="py-1">Variant</th>
                  <th className="py-1">UTM Source</th>
                  <th className="py-1">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads?.map((r: { ts: string; email: string; attraction: string; variant: string; utm_source?: string; utm_campaign?: string }) => (
                  <tr key={r.ts + r.email} className="border-t border-slate-100">
                    <td className="py-1 text-slate-700">{r.ts}</td>
                    <td className="py-1 text-slate-700">{r.email}</td>
                    <td className="py-1 text-slate-700">{r.attraction}</td>
                    <td className="py-1 text-slate-700">{r.variant}</td>
                    <td className="py-1 text-slate-700">{r.utm_source}</td>
                    <td className="py-1 text-slate-700">{r.utm_campaign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right">
            <Link href={((process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL || "").replace(/\/$/, "")) + "/admin/leads.csv"} className="text-sm text-slate-700 underline" prefetch={false}>Download CSV</Link>
          </div>
        </div>
      )}
    </main>
  );
}


