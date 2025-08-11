"use client";
import { useState } from "react";

// price is currently displayed by the server page; kept here for future use
export default function PriceIntent({ price }: { price: number }) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | boolean>(null);

  async function sendIntent(willPay: boolean) {
    setSending(true);
    await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ willPay }),
    }).catch(() => {});
    setDone(willPay);
    setSending(false);
  }

  return (
    <div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          disabled={sending || done !== null}
          onClick={() => sendIntent(true)}
          className="rounded-lg bg-slate-900 text-white px-5 py-3 font-medium disabled:opacity-60"
        >
          Yes
        </button>
        <button
          disabled={sending || done !== null}
          onClick={() => sendIntent(false)}
          className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-800 disabled:opacity-60"
        >
          Not now
        </button>
      </div>
      {done !== null && (
        <p className="mt-4 text-slate-700">
          Thanks! {done ? "We’ll prioritize you for early access." : "No worries — we’ll still notify you when we launch."}
        </p>
      )}
    </div>
  );
}


