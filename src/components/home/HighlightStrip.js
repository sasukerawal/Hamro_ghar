import React from "react";
import { ShieldCheck, PhoneCall, Zap, AlertCircle } from "lucide-react";

/**
 * HighlightStrip - Premium feature highlights with glassmorphism.
 */
export const HighlightStrip = ({ t }) => (
  <section className="relative z-10 py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid gap-8 md:grid-cols-3">
        <HighlightItem
          icon={<ShieldCheck className="h-6 w-6 text-blue-600" />}
          title={t.strip1Title}
          text={t.strip1Text}
          delay="0s"
        />
        <HighlightItem
          icon={<Zap className="h-6 w-6 text-blue-600" />}
          title={t.strip2Title}
          text={t.strip2Text}
          delay="0.1s"
        />
        <HighlightItem
          icon={<PhoneCall className="h-6 w-6 text-blue-600" />}
          title={t.strip3Title}
          text={t.strip3Text}
          delay="0.2s"
        />
      </div>

      {/* Risk notice - Premium Alert */}
      <div className="mt-12 group">
        <div className="relative overflow-hidden rounded-[2rem] glass border border-amber-100 bg-amber-50/30 p-6 shadow-xl shadow-amber-500/5 transition-all hover:bg-white hover:shadow-2xl hover:shadow-amber-500/10">
          {/* Decor Glow */}
          <div className="absolute -top-12 -right-12 h-32 w-32 bg-amber-200/20 blur-[40px] rounded-full group-hover:bg-amber-200/40 transition-colors" />

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/50 text-amber-600 animate-pulse-glow">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                {t.riskTitle}
              </h4>
              <p className="text-sm font-medium text-amber-900/70 leading-relaxed">
                {t.riskText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HighlightItem = ({ icon, title, text, delay }) => (
  <div
    className="group relative rounded-[2.5rem] glass p-8 border border-white hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
    style={{ animationDelay: delay }}
  >
    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-[10deg] transition-all duration-500">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-black text-slate-900 tracking-tight">
      {title}
    </h3>
    <p className="text-sm font-medium text-slate-500 leading-relaxed">
      {text}
    </p>
  </div>
);

export default HighlightStrip;
