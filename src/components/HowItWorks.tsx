export default function HowItWorks() {
  const items = [
    { title: "We check every 60s", desc: "Constantly scan official booking pages for your dates." },
    { title: "We alert instantly", desc: "Email (and SMS soon) the moment tickets appear." },
    { title: "You book first", desc: "Tap the link and grab your slot before it’s gone." },
  ];
  return (
    <section id="how" className="px-6 sm:px-8 py-12 sm:py-16 max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center">How it works</h2>
      <div className="mt-8 grid sm:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-medium text-slate-900">{it.title}</h3>
            <p className="mt-2 text-slate-600">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


