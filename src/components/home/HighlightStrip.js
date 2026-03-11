import React from "react";
import { Home as HomeIcon, Phone, AlertTriangle } from "lucide-react";

export const HighlightStrip = ({ t }) => (
  <section className="bg-white border-y border-blue-50">
    <div className="max-w-6xl mx-auto px-4 py-6 grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
      <HighlightItem
        icon={<HomeIcon className="h-4 w-4 text-blue-500" />}
        title={t.strip1Title}
        text={t.strip1Text}
      />
      <HighlightItem
        icon={<HomeIcon className="h-4 w-4 text-blue-500" />}
        title={t.strip2Title}
        text={t.strip2Text}
      />
      <HighlightItem
        icon={<Phone className="h-4 w-4 text-blue-500" />}
        title={t.strip3Title}
        text={t.strip3Text}
      />
    </div>
    {/* Risk notice */}
    <div className="max-w-6xl mx-auto px-4 pb-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <span className="font-bold">{t.riskTitle} —</span> {t.riskText}
        </p>
      </div>
    </div>
  </section>
);

const HighlightItem = ({ icon, title, text }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-slate-500 text-xs">{text}</p>
    </div>
  </div>
);

export default HighlightStrip;
