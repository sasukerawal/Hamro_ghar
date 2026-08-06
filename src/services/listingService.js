/**
 * Listing Service
 * Handles listing-related API operations and persistent logic.
 */
import React from 'react';
import { apiFetch } from '../api';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

/**
 * Toggles the saved status of a property.
 * 
 * @param {Object} listing - The property listing object.
 * @param {Array} savedIds - Current list of saved property IDs.
 * @param {Function} setSavedIds - State setter for saved property IDs.
 * @param {Function} onGoLogin - Callback to trigger login navigation if unauthorized.
 */
export async function toggleSaveListing(listing, savedIds, setSavedIds, onGoLogin) {
    const id = listing?._id || listing?.id;
    if (!id) {
        console.warn('Listing ID missing during save toggle');
        return;
    }

    // Demo handles prevention
    if (String(id).startsWith("demo-")) {
        toast.info("Demo homes cannot be saved to your profile.");
        return;
    }

    const isSaved = savedIds.includes(id);

    try {
        // API request to toggle save status
        await apiFetch(`/api/listings/save/${id}`, {
            method: isSaved ? "DELETE" : "POST",
        });

        // Update local state
        setSavedIds((prev) =>
            isSaved ? prev.filter((sid) => sid !== id) : [...prev, id]
        );

        // Success notification
        toast.success(
            isSaved ? (
                "Removed from your favourites"
            ) : (
                <span className="inline-flex items-center gap-1">
                    Home saved to favourites <Heart className="h-3.5 w-3.5 fill-current" />
                </span>
            )
        );
    } catch (err) {
        // Handle specific auth failures
        if (err.status === 401 && onGoLogin) {
            toast.info("Please log in to save properties.");
            onGoLogin();
        } else {
            toast.error(err.message || "Could not update saved status");
        }
    }
}

/**
 * Tracks a view on a property asynchronously.
 * 
 * @param {string} id - The listing ID.
 */
export async function trackListingView(id) {
    if (!id || String(id).startsWith("demo-")) return;

    try {
        await apiFetch(`/api/listings/${id}/view`, {
            method: "PATCH",
            credentials: "omit",
        });
    } catch (_) {
        // Silently fail for view tracking
    }
}
