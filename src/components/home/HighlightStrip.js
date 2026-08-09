import React from "react";
import { Home as HomeIcon, Phone, AlertTriangle, Wifi, Users } from "lucide-react";

const ICONS = {
  home: <HomeIcon className="h-5 w-5 text-gold-700" />,
  wifi: <Wifi className="h-5 w-5 text-gold-700" />,
  phone: <Phone className="h-5 w-5 text-gold-700" />,
  users: <Users className="h-5 w-5 text-gold-700" />,
};

export const HighlightStrip = ({ t }) => (
  // No border-y: the white background already reads as a distinct band
  // against the slate-50 hero above and slate-50 listings grid below —
  // a hairline here was redundant, and mechanically made this whole
  // section register as a "card" that its own tiles nested inside.
  <section className="bg-white">
    <div className="max-w-6xl mx-auto px-4 py-8 grid gap-5 sm:grid-cols-3">
      <HighlightItem icon={ICONS.users} title={t.strip1Title} text={t.strip1Text} delay="0ms" />
      <HighlightItem icon={ICONS.wifi} title={t.strip2Title} text={t.strip2Text} delay="80ms" />
      <HighlightItem icon={ICONS.phone} title={t.strip3Title} text={t.strip3Text} delay="160ms" />
    </div>

    {/* Risk notice */}
    <div className="max-w-6xl mx-auto px-4 pb-5">
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3.5 shadow-sm">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        {/* 11px is below the 12px body-text floor — bumped since this is
            a safety warning, the last text on the page that should be
            hard to read. */}
        <p className="text-xs text-amber-800 leading-relaxed max-w-[58ch]">
          <span className="font-bold">{t.riskTitle} —</span> {t.riskText}
        </p>
      </div>
    </div>
  </section>
);

const HighlightItem = ({ icon, title, text, delay = "0ms" }) => (
  <div
    className="flex items-start gap-3.5 p-4 rounded-2xl bg-white shadow-sm shadow-slate-900/5 border border-slate-100 hover:border-gold-200 hover:shadow-md hover:shadow-gold-900/5 transition-all duration-300 animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-slate-900 text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default HighlightStrip;
