import React from 'react';

/**
 * AmenityTag - A styled tag for displaying property amenities.
 * 
 * @param {Object} props
 * @param {boolean} props.active - Whether the amenity is present.
 * @param {React.ReactNode} props.children - The name or icon of the amenity.
 */
const AmenityTag = ({ active, children }) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors";
    const activeClasses = active
        ? "border-blue-200 bg-blue-50 text-gold-700 font-semibold"
        : "border-slate-200 bg-white text-slate-500";

    return (
        <span className={`${baseClasses} ${activeClasses}`}>
            {children}
        </span>
    );
};

export default React.memo(AmenityTag);
