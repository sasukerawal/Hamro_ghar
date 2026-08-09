import React from "react";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useRipple } from "../common/Ripple";

export const CallToAction = ({ t, onGoRegister, onGoMembership }) => {
  const { ref, isVisible } = useScrollReveal();
  const ctaRipple = useRipple();

  return (
    <section ref={ref} className="relative bg-[#1A1410] text-white py-14 overflow-hidden">
      {/* Faint stamp-ring watermark, echoing the verification motif.
          (A blurred radial glow was tried here too, but a chromatic
          radial fade on a dark background is the exact same AI-tell as
          a glowing shadow, just drawn with a gradient — dropped it.) */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border-[3px] border-ember-400/[0.10]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border-[3px] border-ember-400/[0.10] rotate-12" />
      <div className="pointer-events-none absolute -left-14 -bottom-14 h-40 w-40 rounded-full border-[3px] border-gold-400/[0.08]" />

      <div
        className={`relative max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 z-10 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div>
          {/* No eyebrow label — the heading carries this on its own */}
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
            {t.ctaTitle}
          </h2>
          <p className="mt-2 text-sm text-white/70 max-w-md leading-relaxed">
            {t.ctaSub}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onGoRegister}
            onPointerDown={ctaRipple.onPointerDown}
            className="relative overflow-hidden inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-500 to-ember-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:shadow-2xl hover:from-gold-600 hover:to-ember-700 active:scale-95 transition-all"
          >
            {ctaRipple.rippleLayer}
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
};

export default CallToAction;
