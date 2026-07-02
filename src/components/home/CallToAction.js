import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export const CallToAction = ({ t, onGoRegister, onGoMembership }) => (
  <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white py-14 overflow-hidden">
    {/* Blobs */}
    <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

    <div className="relative max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-blue-200 mb-2 font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          {t.ctaTag}
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
          {t.ctaTitle}
        </h2>
        <p className="mt-2 text-sm text-blue-100 max-w-md leading-relaxed">
          {t.ctaSub}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onGoRegister}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-xl hover:bg-slate-50 hover:shadow-2xl active:scale-95 transition-all"
        >
          {t.ctaBtn1}
        </button>
        <button
          type="button"
          onClick={onGoMembership}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-3 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          {t.ctaBtn2}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

export default CallToAction;
