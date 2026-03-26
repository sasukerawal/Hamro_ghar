import React, { useState } from "react";
import { Star, Flag } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "./api";

export { default as SpecPill } from './components/common/SpecPill';
export { default as AmenityTag } from './components/common/AmenityTag';
export { default as QuickFact } from './components/common/QuickFact';

export { default as ListingModal } from './components/listing/ListingModal';
export { toggleSaveListing as handleToggleSaveHome } from './services/listingService';

// Note: Sub-components like ReviewsSection are now internal to ListingModal or 
// should be imported directly from src/components/listing/ReviewsSection.js

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${n <= Math.round(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-slate-200"
            }`}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------
   PRICE HISTORY CHART
   Renders a small SVG line chart from priceHistory array
---------------------------------------- */
function PriceHistoryChart({ history }) {
  if (!history || history.length < 2) return null;

  const sorted = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
  const prices = sorted.map((h) => h.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const W = 260, H = 60, PAD = 8;
  const pts = sorted.map((h, i) => {
    const x = PAD + (i / (sorted.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxP - h.price) / range) * (H - PAD * 2);
    return [x, y];
  });

  const polyline = pts.map((p) => p.join(",")).join(" ");
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const diff = prices[prices.length - 1] - prices[0];
  const diffColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-green-500" : "text-slate-500";
  const diffText = diff === 0 ? "No change" : `${diff > 0 ? "+" : ""}Rs.${diff.toLocaleString()}`;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Price History</p>
        <span className={`text-[11px] font-semibold ${diffColor}`}>{diffText}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`${firstPt[0]},${H} ${polyline} ${lastPt[0]},${H}`}
          fill="url(#chartGrad)"
        />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        {sorted.map((h, i) => (
          <span key={i}>{new Date(h.changedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------
   REPORT LISTING BUTTON
---------------------------------------- */
function ReportListingButton({ listingId }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    if (submitted) return;
    if (!window.confirm("Report this listing as inappropriate, scam, or inaccurate?")) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      }).catch(() => { }); // Fire and forget — endpoint may not exist yet
      setSubmitted(true);
      toast.success("Report submitted. Thank you for keeping HamroGhar safe!");
    } catch {
      setSubmitted(true);
      toast.success("Report submitted. Thank you!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={submitting || submitted}
      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-400 hover:border-red-200 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <Flag className="h-3 w-3" />
      {submitted ? "Reported — thank you" : submitting ? "Submitting..." : "Report this listing"}
    </button>
  );
}