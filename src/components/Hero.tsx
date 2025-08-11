import React from "react";

type Props = { variant: "a" | "b"; price: number };
export default function Hero({ variant, price }: Props) {
  const headline =
    variant === "a"
      ? "Paris’s Top Attractions Sell Out Fast. We’ll Alert You the Second New Tickets Appear."
      : "Never Miss Out on Notre Dame, Eiffel Tower, or Catacombs Tickets Again.";

  const subtitle =
    "We monitor official booking sites every 60 seconds and notify you instantly when sold-out tickets are back—so you can book before they’re gone.";

  return (
    <section className="px-6 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto text-center">
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900">{headline}</h1>
      <p className="mt-5 text-lg text-slate-700">{subtitle}</p>
      <div className="mt-8 inline-flex items-center gap-3">
        <a href="#signup" className="rounded-lg bg-slate-900 text-white px-6 py-3 text-lg font-medium shadow hover:opacity-90">
          Get Instant Alerts — from €{price}/week
        </a>
        <a href="#how" className="text-slate-700 hover:underline">How it works</a>
      </div>
    </section>
  );
}


