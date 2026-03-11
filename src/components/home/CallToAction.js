import React from "react";
import { ArrowRight } from "lucide-react";

export const CallToAction = ({ t, onGoRegister, onGoMembership }) => (
  <section className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-12">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-1">
          {t.ctaTag}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold">
          {t.ctaTitle}
        </h2>
        <p className="mt-2 text-sm text-blue-100 max-w-md">
          {t.ctaSub}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onGoRegister}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md hover:bg-slate-100"
        >
          {t.ctaBtn1}
        </button>
        <button
          type="button"
          onClick={onGoMembership}
          className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500/40"
        >
          {t.ctaBtn2}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

export default CallToAction;
