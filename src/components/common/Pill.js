// src/components/common/Pill.js
import React from 'react';

/**
 * Pill — the single "Chips / Pills" implementation per DESIGN.md §5.
 * Full-pill shape; active = solid terracotta with white text, inactive =
 * white with a slate-200 border. `variant="hostel"` keeps the documented
 * purple category exception distinct from the deal-type terracotta state.
 *
 * Renders a <button> when onClick is provided (so it's keyboard-operable),
 * otherwise a <span> for purely decorative/status badges.
 */
const VARIANTS = {
    default: {
        active: 'border-gold-500 bg-gold-500 text-white font-bold',
        inactive: 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 font-medium',
    },
    hostel: {
        active: 'border-purple-500 bg-purple-500 text-white font-bold',
        inactive: 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 font-medium',
    },
    success: {
        active: 'border-emerald-500 bg-emerald-500 text-white font-bold',
        inactive: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium',
    },
    danger: {
        active: 'border-red-500 bg-red-500 text-white font-bold',
        inactive: 'border-red-200 bg-red-50 text-red-700 font-medium',
    },
};

// Both sizes hit the 44px touch-target minimum; "sm" only tightens
// horizontal padding for dense filter trays, never the tap height.
const SIZES = {
    sm: 'px-3 text-[11px] gap-1.5 min-h-[44px]',
    md: 'px-4 text-xs gap-2 min-h-[44px]',
};

export default function Pill({
    active = false,
    onClick,
    children,
    icon,
    variant = 'default',
    size = 'md',
    className = '',
    ...rest
}) {
    const tone = VARIANTS[variant] || VARIANTS.default;
    const classes = `inline-flex items-center justify-center rounded-full border transition-colors ${SIZES[size]} ${active ? tone.active : tone.inactive} ${className}`;

    if (onClick) {
        return (
            <button type="button" onClick={onClick} aria-pressed={active} className={classes} {...rest}>
                {icon}
                {children}
            </button>
        );
    }

    return (
        <span className={classes} {...rest}>
            {icon}
            {children}
        </span>
    );
}
