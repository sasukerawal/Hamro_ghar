import React, { useState, useEffect } from "react";
import { Star, Loader, MessageSquare, Trash2, Send } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "../../api";

/**
 * SiteReviewsSection - Premium testimonial section with glassmorphism.
 */
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
      apiFetch("/api/auth/me").then((d) => setCurrentUserId(d?.user?.id || d?.user?._id)).catch(() => { });
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
      .catch(() => { })
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

  return (
    <section className="relative py-24 bg-[#fcfcfd] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Column */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-black tracking-[0.3em] text-blue-600 uppercase mb-3">
              {t.communityTag}
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {t.communityTitle}
            </h2>
          </div>
          {avgRating && (
            <div className="glass px-6 py-3 rounded-[2rem] border border-white flex items-center gap-3 shadow-xl shadow-blue-500/5 animate-float">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 leading-none">{avgRating}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Global Rating</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit form — logged in only */}
        {isLoggedIn && (
          <form onSubmit={handleSubmit} className="relative z-10 glass rounded-[2.5rem] p-8 mb-16 border border-white shadow-2xl shadow-blue-500/5 overflow-hidden group">
            {/* Form Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-colors" />

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {myReviewId ? t.reviewUpdate2 : t.reviewShare}
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/40 border border-white/50 w-fit">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setMyRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} className="focus:outline-none transition-transform hover:scale-125">
                    <Star className={`h-8 w-8 transition-colors ${n <= (hover || myRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                  </button>
                ))}
                {myRating > 0 && <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-4">{labels[myRating - 1]}</span>}
              </div>

              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder={t.reviewPlaceholder}
                maxLength={400}
                className="w-full text-base font-medium rounded-3xl border border-white bg-white/60 p-6 outline-none focus:border-blue-400 focus:bg-white transition-all min-h-[140px] resize-none shadow-inner"
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl py-4 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {submitting ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {myReviewId ? t.reviewUpdate : t.reviewSubmit}
                </button>
                {myReviewId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="h-14 w-14 flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                    title={t.reviewRemove}
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-[2.5rem] h-48 shimmer" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 glass rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-sm text-slate-400 italic font-medium">{t.reviewNone}</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <div key={r._id} className="relative group rounded-[2.5rem] glass p-8 border border-white shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-100"}`} />
                  ))}
                </div>

                <p className="text-slate-700 italic font-medium leading-relaxed mb-8">
                  "{r.comment}"
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-400 text-xs">
                    {r.userName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-900 leading-none">{r.userName}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SiteReviewsSection;
