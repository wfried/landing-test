import Link from "next/link";

type Summary = {
  ok: boolean;
  leadsCount: number;
  intentsCount: number;
  leadsByVariant: Array<{ variant: string; n: number }>;
  intentAgg: Array<{ variant: string; yes: number; no: number }>;
  recentLeads: Array<{ ts: string; email: string; attraction: string; variant: string; utm_source?: string; utm_campaign?: string }>;
};

async function fetchSummary(): Promise<Summary | { ok: false }> {
  const url = process.env.LEAD_WEBHOOK_URL?.replace(/\/$/, "") + "/admin/summary";
  const token = process.env.LEAD_WEBHOOK_TOKEN;
  const res = await fetch(url!, { headers: token ? { Authorization: `Bearer ${token}` } : {} , cache: "no-store" });
  if (!res.ok) return { ok: false };
  return res.json();
}

export default async function AdminPage() {
  const data = await fetchSummary();
  return (
    <main className="px-6 sm:px-8 py-12 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
      {!data?.ok ? (
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
            <Link href={(process.env.LEAD_WEBHOOK_URL?.replace(/\/$/, "") || "") + "/admin/leads.csv"} className="text-sm text-slate-700 underline">Download CSV</Link>
          </div>
        </div>
      )}
    </main>
  );
}


