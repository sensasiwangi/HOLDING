"use client";

import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";

export default function Hero() {
  const { lang } = useLang();

  function tr(key: string): string {
    const keys = key.split(".");
    let val: any = dict;
    for (const k of keys) {
      val = val?.[k];
      if (!val) return key;
    }
    if (typeof val === "object" && val[lang]) return val[lang];
    return val;
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#eef8f4] to-white border-b border-[var(--line)]">
        <div className="container max-w-[1240px] mx-auto px-6 py-20 grid md:grid-cols-[1.1fr_.9fr] gap-8 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--brand)] font-bold">
              {tr("hero.eyebrow")}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-2 text-[var(--ink)]">
              {tr("hero.title")}
            </h1>
            <p className="text-lg text-[#354943] mt-4 max-w-[690px]">
              {tr("hero.subtitle")}
            </p>
            <div className="flex gap-3 mt-6 flex-wrap">
              <a href="#investor" className="px-5 py-3 rounded-lg bg-[var(--brand)] text-white font-bold text-sm hover:bg-[var(--brand-2)] transition">
                {tr("hero.ctaInvestor")}
              </a>
              <a href="#divisions" className="px-5 py-3 rounded-lg border border-[var(--line)] bg-white font-bold text-sm hover:border-[var(--brand)] transition">
                {tr("hero.ctaDivisions")}
              </a>
            </div>
          </div>
          <div className="border border-[var(--line)] rounded-lg bg-white p-6">
            <div className="inline-block rounded-full bg-[var(--soft-2)] border border-[var(--line)] px-3 py-1 text-xs font-bold text-[var(--brand)]">
              {tr("signal.tag")}
            </div>
            <h2 className="text-xl font-bold mt-3 text-[var(--ink)]">{tr("signal.title")}</h2>
            <p className="text-sm text-[var(--muted)] mt-2">{tr("signal.subtitle")}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: "Store", desc: tr("signal.store") },
                { label: "Event", desc: tr("signal.event") },
                { label: "Brand", desc: tr("signal.brand") },
                { label: "WEB", desc: tr("signal.web") },
              ].map((s) => (
                <div key={s.label} className="border border-[var(--line)] rounded-lg p-3 bg-[var(--soft)]">
                  <span className="block text-xl font-extrabold text-[var(--brand)]">{s.label}</span>
                  <span className="text-xs text-[var(--muted)]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="container max-w-[1240px] mx-auto px-6 py-16">
        <h2 className="text-xs uppercase tracking-widest text-[var(--brand)] font-bold">
          {tr("about.eyebrow")}
        </h2>
        <h3 className="text-3xl font-extrabold text-[var(--ink)] mt-2">{tr("about.title")}</h3>
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 mt-8">
          <div>
            <p className="text-[#354943] text-base">{tr("about.p1")}</p>
            <p className="text-[#354943] text-base mt-4">{tr("about.p2")}</p>
          </div>
          <div className="space-y-4">
            <div className="border border-[var(--line)] rounded-lg p-5 bg-white">
              <h4 className="font-bold text-[var(--brand)] text-sm">{tr("about.mission")}</h4>
              <p className="text-sm mt-1 text-[#354943]">{tr("about.missionText")}</p>
            </div>
            <div className="border border-[var(--line)] rounded-lg p-5 bg-white">
              <h4 className="font-bold text-[var(--brand)] text-sm">{tr("about.vision")}</h4>
              <p className="text-sm mt-1 text-[#354943]">{tr("about.visionText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions Overview */}
      <section id="divisions" className="container max-w-[1240px] mx-auto px-6 py-16">
        <h2 className="text-xs uppercase tracking-widest text-[var(--brand)] font-bold">
          {tr("divisions.eyebrow")}
        </h2>
        <h3 className="text-3xl font-extrabold text-[var(--ink)] mt-2">{tr("divisions.title")}</h3>
        <p className="text-[var(--muted)] mt-2">{tr("divisions.subtitle")}</p>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {[
            { name: tr("divisions.office"), desc: tr("divisions.officeDesc"), pct: 45 },
            { name: tr("divisions.store"), desc: tr("divisions.storeDesc"), pct: 55 },
            { name: tr("divisions.event"), desc: tr("divisions.eventDesc"), pct: 38 },
            { name: tr("divisions.production"), desc: tr("divisions.productionDesc"), pct: 48 },
            { name: tr("divisions.digital"), desc: tr("divisions.digitalDesc"), pct: 42 },
            { name: tr("divisions.marketing"), desc: tr("divisions.marketingDesc"), pct: 40 },
          ].map((d) => (
            <div key={d.name} className="border border-[var(--line)] rounded-lg p-5 bg-white flex flex-col gap-3">
              <h4 className="font-bold text-[var(--ink)]">{d.name}</h4>
              <p className="text-sm text-[var(--muted)] flex-1">{d.desc}</p>
              <div>
                <div className="h-2 bg-[#e8efec] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <small className="text-[var(--muted)] text-xs">{d.pct}%</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Investor CTA */}
      <section id="investor" className="container max-w-[1240px] mx-auto px-6 py-16">
        <div className="border border-[var(--line)] rounded-lg p-8 md:p-12 bg-gradient-to-br from-[#eef8f4] to-white text-center">
          <h2 className="text-xs uppercase tracking-widest text-[var(--brand)] font-bold">
            {tr("investor.eyebrow")}
          </h2>
          <h3 className="text-3xl font-extrabold text-[var(--ink)] mt-2">{tr("investor.title")}</h3>
          <p className="text-[var(--muted)] mt-3 max-w-[600px] mx-auto">{tr("investor.subtitle")}</p>
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <a href="/investor" className="px-5 py-3 rounded-lg bg-[var(--brand)] text-white font-bold text-sm hover:bg-[var(--brand-2)] transition">
              {tr("investor.ctaInvestor")}
            </a>
            <a href="/dashboard" className="px-5 py-3 rounded-lg border border-[var(--line)] bg-white font-bold text-sm hover:border-[var(--brand)] transition">
              {tr("nav.dashboard")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
