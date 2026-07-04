import React, { useState, useEffect, useCallback } from 'react';
import { Star, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiFetch } from '../../api';

/**
 * ReviewsSection - Handles property-specific reviews and ratings.
 * 
 * @param {Object} props
 * @param {string} props.listingId - The ID of the listing to display reviews for.
 */
const ReviewsSection = ({ listingId }) => {
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // User interaction state
    const [myRating, setMyRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [myComment, setMyComment] = useState("");
    const [myReviewId, setMyReviewId] = useState(null);

    // Auth state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Initialize auth state
    useEffect(() => {
        apiFetch("/api/auth/me")
            .then((data) => {
                if (data?.user) {
                    setIsLoggedIn(true);
                    setCurrentUserId(data.user.id || data.user._id);
                }
            })
            .catch(() => setIsLoggedIn(false));
    }, []);

    // Fetch reviews for the listing
    const fetchReviews = useCallback(async () => {
        if (!listingId || String(listingId).startsWith("demo-")) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await apiFetch(`/api/reviews/${listingId}`, { credentials: "omit" });
            setReviews(data.reviews || []);
            setAvgRating(data.avgRating);

            // Check if user already reviewed this listing
            if (currentUserId) {
                const userReview = (data.reviews || []).find(
                    (r) => String(r.reviewerId) === String(currentUserId)
                );
                if (userReview) {
                    setMyRating(userReview.rating);
                    setMyComment(userReview.comment);
                    setMyReviewId(userReview._id);
                }
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setLoading(false);
        }
    }, [listingId, currentUserId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!myRating) return toast.error("Please select a star rating");
        if (myComment.trim().length < 5) return toast.error("Comment must be at least 5 characters");

        try {
            setSubmitting(true);
            const data = await apiFetch(`/api/reviews/${listingId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
            });

            if (data.review) {
                toast.success(myReviewId ? "Review updated!" : "Review submitted!");
                fetchReviews(); // Refresh data
            }
        } catch (err) {
            toast.error(err.message || "Could not submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!myReviewId) return;
        try {
            await apiFetch(`/api/reviews/${myReviewId}`, { method: "DELETE" });
            toast.success("Review removed");
            setMyRating(0);
            setMyComment("");
            setMyReviewId(null);
            fetchReviews();
        } catch (err) {
            toast.error(err.message || "Could not delete review");
        }
    };

    if (String(listingId).startsWith("demo-")) return null;

    return (
        <div className="border-t border-slate-100 pt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Reviews ({reviews.length})
                </h3>
                {avgRating !== null && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < Math.floor(avgRating) ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{avgRating}/5</span>
                    </div>
                )}
            </div>

            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-4">
                    <p className="text-xs font-bold text-slate-700">
                        {myReviewId ? "Update your experience" : "Write a review"}
                    </p>

                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setMyRating(n)}
                                onMouseEnter={() => setHoverRating(n)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star className={`h-6 w-6 ${n <= (hoverRating || myRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                            </button>
                        ))}
                        {myRating > 0 && (
                            <span className="text-xs font-semibold text-slate-500 ml-2">
                                {["Terrible", "Poor", "Average", "Good", "Excellent"][myRating - 1]}
                            </span>
                        )}
                    </div>

                    <textarea
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        placeholder="What was it like? Mention the owner, condition, or neighborhood..."
                        className="w-full text-sm rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-blue-50 resize-none min-h-[100px]"
                    />

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-gold-500 text-white text-sm font-bold rounded-xl py-3 hover:bg-gold-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all"
                        >
                            {submitting && <Loader className="h-4 w-4 animate-spin" />}
                            {myReviewId ? "Update Review" : "Post Review"}
                        </button>
                        {myReviewId && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-6 py-3 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-sm text-slate-500">Log in to share your experience with this property.</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader className="h-6 w-6 animate-spin text-gold-400" />
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => (
                        <div key={rev._id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-900">{rev.reviewerName || "Visitor"}</span>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(ReviewsSection);
