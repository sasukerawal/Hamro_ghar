import React, { useState, useEffect } from "react";
import { Star, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "../../api";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";

export function SiteReviewsSection({ isLoggedIn, t }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [myReviewId, setMyReviewId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      apiFetch("/api/auth/me").then((d) => setCurrentUserId(d?.user?.id || d?.user?._id)).catch(() => {});
    }
  }, [isLoggedIn]);

  const load = () => {
    setLoading(true);
    apiFetch("/api/site-reviews", { credentials: "omit" })
      .then((d) => {
        setReviews(d.reviews || []);
        setAvgRating(d.avgRating);
        if (currentUserId) {
          const mine = (d.reviews || []).find((r) => String(r.userId) === String(currentUserId));
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment); setMyReviewId(mine._id); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [currentUserId]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { toast.error("Please pick a star rating"); return; }
    if (myComment.trim().length < 5) { toast.error("Comment must be at least 5 characters"); return; }
    setSubmitting(true);
    try {
      const data = await apiFetch("/api/site-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      if (data.review) {
        setMyReviewId(data.review._id);
        toast.success("Thank you for your review!");
        load();
      }
    } catch (err) { toast.error(err.message || "Could not submit review"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!myReviewId) return;
    try {
      await apiFetch(`/api/site-reviews/${myReviewId}`, { method: "DELETE" });
      setMyRating(0); setMyComment(""); setMyReviewId(null);
      toast.success("Review removed");
      load();
    } catch (err) { toast.error(err.message || "Could not delete review"); }
  };

  const labels = ["Terrible", "Poor", "Average", "Good", "Excellent"];
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-white py-12">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-4 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          {/* No eyebrow label — the heading carries this on its own */}
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900">{t.communityTitle}</h2>
          {avgRating && (
            <div className="flex items-center gap-1.5 bg-gold-50 border border-gold-200 rounded-2xl px-3 py-1.5">
              <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
              <span className="text-sm font-bold text-slate-800">{avgRating}</span>
              <span className="text-xs text-slate-500">/ 5</span>
            </div>
          )}
        </div>

        {/* Submit form — logged in only */}
        {isLoggedIn && (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-gold-100 rounded-2xl p-4 mb-6 space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              {myReviewId ? t.reviewUpdate2 : t.reviewShare}
            </p>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setMyRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`} className="p-2.5 -m-2.5 focus:outline-none">
                  <Star className={`h-6 w-6 transition-colors ${n <= (hover || myRating) ? "text-gold-500 fill-gold-500" : "text-slate-300"}`} />
                </button>
              ))}
              {myRating > 0 && <span className="text-xs text-slate-500 ml-2">{labels[myRating - 1]}</span>}
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder={t.reviewPlaceholder}
              maxLength={400}
              className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-gold-300 min-h-[70px] resize-none"
            />
            <div className="flex items-center gap-2">
              <button type="submit" disabled={submitting} className="flex-1 bg-gold-500 text-white text-sm font-semibold rounded-xl py-2 min-h-[44px] hover:bg-gold-600 disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                {myReviewId ? t.reviewUpdate : t.reviewSubmit}
              </button>
              {myReviewId && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 min-h-[44px] text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">{t.reviewRemove}</button>
              )}
            </div>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <LoadingState variant="inline" label="Loading reviews…" className="py-8" />
        ) : reviews.length === 0 ? (
          <EmptyState icon={Star} title={t.reviewNone} className="py-6" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <div
                key={r._id}
                className="rounded-2xl border border-gold-100 bg-slate-50/60 p-4 shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <div className="flex items-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "text-gold-500 fill-gold-500" : "text-slate-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 mb-3">"{r.comment}"</p>
                <p className="text-xs font-semibold text-blue-900">{r.userName}</p>
                <p className="text-[11px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SiteReviewsSection;
