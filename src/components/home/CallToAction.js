import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * CallToAction - Premium conversion section with vibrant gradients and glassmorphism.
 */
export const CallToAction = ({ t, onGoRegister, onGoMembership }) => (
  <section className="relative py-24 px-6 overflow-hidden">
    {/* Vibrant Background Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800" />

    {/* Decorative Elements */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-glow" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

    <div className="max-w-7xl mx-auto relative z-10">
      <div className="glass-dark border-white/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <Sparkles className="h-4 w-4 text-sky-300" />
            {t.ctaTag}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            {t.ctaTitle}
          </h2>
          <p className="text-lg font-medium text-blue-100/80 max-w-xl leading-relaxed">
            {t.ctaSub}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={onGoRegister}
            className="group relative h-16 px-10 rounded-2xl bg-white text-blue-700 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:translate-y-[-2px] transition-all active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">{t.ctaBtn1}</span>
            <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            type="button"
            onClick={onGoMembership}
            className="group h-16 px-10 rounded-2xl bg-blue-500/20 border border-white/20 text-white text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {t.ctaBtn2}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default CallToAction;
