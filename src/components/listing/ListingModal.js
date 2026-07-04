import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
    Heart, ChevronLeft, ChevronRight, Edit3, MapPin,
    AlertTriangle, Copy, Share2, X
} from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import SpecPill from '../common/SpecPill';
import AmenityTag from '../common/AmenityTag';
import QuickFact from '../common/QuickFact';
import OwnerSocials from './OwnerSocials';
import ReviewsSection from './ReviewsSection';

/**
 * ListingModal - Comprehensive view for property details in a modal overlay.
 */
const ListingModal = ({
    home,
    onClose,
    onToggleSave,
    isSaved,
    isOwner = false,
    onEdit,
    onUnsave,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Reset image sliding index when home changes
    useEffect(() => {
        setActiveIndex(0);
    }, [home?._id, home?.id]);

    // Derived Values
    const images = useMemo(() => {
        const raw = (home.images?.length ? home.images : (home.image ? [home.image] : []));
        return raw.length ? raw : ["https://placehold.co/800x500/eff6ff/0f172a?text=Home"];
    }, [home.images, home.image]);

    const currentImage = images[activeIndex];

    const mapsUrl = useMemo(() => {
        if (home.mapsUrl?.trim()) return home.mapsUrl;
        if (home.location?.lat && home.location?.lng) {
            return `https://www.google.com/maps/search/?api=1&query=${home.location.lat},${home.location.lng}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${home.address || ""} ${home.city || ""}`.trim())}`;
    }, [home]);

    // Handlers
    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit?.(home);
        onClose();
    };

    const handleToggleHeart = (e) => {
        e.stopPropagation();
        if (onUnsave && isSaved) {
            onUnsave(home);
            onClose();
        } else {
            onToggleSave?.(home);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/?listing=${home._id || home.id}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success("Link copied!"))
            .catch(() => toast.error("Failed to copy link"));
    };

    const name = home.title || home.address || "Property Details";

    if (!home) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            {/* Dynamic SEO */}
            <Helmet>
                <title>{`${name} - HamroGhar`}</title>
                <meta name="description" content={home.description?.substring(0, 160)} />
            </Helmet>

            <div className="w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
                {/* Close & Action Buttons */}
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    {isOwner && (
                        <button onClick={handleEdit} className="bg-white/90 hover:bg-white text-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-black/10 flex items-center gap-2 backdrop-blur-md transition-all active:scale-95">
                            <Edit3 className="h-4 w-4" /> Edit
                        </button>
                    )}
                    <button onClick={onClose} className="bg-white/90 hover:bg-white text-slate-800 h-10 w-10 rounded-full flex items-center justify-center shadow-lg shadow-black/10 backdrop-blur-md transition-all active:scale-95">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Hero Image Section */}
                <div className="relative aspect-video sm:aspect-[21/9] bg-slate-900 overflow-hidden shrink-0 group">
                    <img src={currentImage} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Price Tag */}
                    <div className="absolute left-6 bottom-6 flex flex-col gap-1">
                        <span className="bg-gold-500 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest w-max">
                            For {home.type === "sale" ? "Sale" : "Rent"}
                        </span>
                        <div className="text-white flex items-baseline gap-2">
                            <span className="text-3xl font-black">Rs. {home.price}</span>
                            {home.type !== "sale" && <span className="text-sm font-medium text-white/70">/ month</span>}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev - 1 + images.length) % images.length); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev + 1) % images.length); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                            <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full ring-1 ring-white/20">
                                {activeIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Deep Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 sm:p-10 space-y-10">

                        {/* Header Info */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <SpecPill>{home.specs?.propertyType || "Property"}</SpecPill>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    ID: #{home._id?.toString().slice(-6).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 leading-tight">
                                {name}
                            </h2>
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                                <MapPin className="h-5 w-5 text-gold-600" />
                                <span>{home.location?.municipality || home.city}, {home.location?.district}</span>
                            </div>
                        </div>

                        {/* Grid Facts */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickFact label="Bedrooms" value={home.specs?.bedrooms || home.beds} icon="🛏️" />
                            <QuickFact label="Bathrooms" value={home.specs?.bathrooms || home.baths} icon="🛁" />
                            <QuickFact label="Land Area" value={home.specs?.display || home.sqft} icon="📐" />
                            <QuickFact label="Facing" value={home.specs?.facing} icon="🧭" />
                        </div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-10">
                                <section>
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3">
                                        <div className="h-6 w-1 rounded-full bg-gold-500" />
                                        Overview
                                    </h3>
                                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                        {home.description}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3">
                                        <div className="h-6 w-1 rounded-full bg-gold-500" />
                                        Facilities
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {home.facilities?.carParking > 0 && <AmenityTag active>🚗 Car Parking ({home.facilities.carParking})</AmenityTag>}
                                        {home.facilities?.bikeParking > 0 && <AmenityTag active>🏍️ Bike Parking ({home.facilities.bikeParking})</AmenityTag>}
                                        {home.specs?.furnishing && <AmenityTag active>🛋️ {home.specs.furnishing}</AmenityTag>}
                                        {home.amenities?.map(a => <AmenityTag key={a} active>✨ {a}</AmenityTag>)}
                                    </div>
                                </section>

                                {/* Disclaimer */}
                                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                        <strong className="block mb-1">Stay Safe:</strong> Never pay a deposit before visiting the property. We do not verify listings. Report suspicious posters.
                                    </p>
                                </div>

                                <ReviewsSection listingId={home._id || home.id} />
                            </div>

                            {/* Sidebar Actions */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 sticky top-4 space-y-6">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Connect</h3>
                                    <OwnerSocials socials={home.owner?.socials} />

                                    <div className="h-px bg-slate-200" />

                                    <div className="space-y-3">
                                        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.98]">
                                            <MapPin className="h-4 w-4" /> View Map
                                        </a>
                                        <button onClick={handleToggleHeart} className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg ${isSaved ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gold-500 text-white shadow-blue-200'}`}>
                                            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                                            {isSaved ? "Saved to Profile" : "Save this Home"}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Share</span>
                                        <div className="flex gap-2">
                                            <button onClick={handleCopyLink} className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-gold-700 hover:border-blue-100 transition-all"><Copy className="h-4 w-4" /></button>
                                            <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-green-600 hover:border-green-100 transition-all"><Share2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ListingModal);
