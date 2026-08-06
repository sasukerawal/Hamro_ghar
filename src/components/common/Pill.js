// src/components/common/Pill.js
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Pill — the single "Chips / Pills" implementation per DESIGN.md §5.
 * Full-pill shape; active = solid terracotta with white text, inactive =
 * white with a slate-200 border. `variant="hostel"` keeps the documented
 * purple category exception distinct from the deal-type terracotta state.
 *
 * Renders a <button> when onClick is provided (so it's keyboard-operable),
 * otherwise a <span> for purely decorative/status badges.
 *
 * `layoutId` (optional) opts a group of sibling Pills into a shared,
 * spring-animated background — the active fill glides between pills
 * instead of popping, like a segmented control. Pass the SAME id to every
 * Pill in one on-screen group (e.g. `layoutId="dealType"`); groups that
 * render simultaneously (desktop vs. mobile) need distinct ids so Framer
 * Motion doesn't try to animate between two mounted-at-once elements.
 */
const VARIANTS = {
    default: {
        active: 'border-gold-500 bg-gold-500 text-white font-bold',
        inactive: 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 font-medium',
        bg: 'bg-gold-500',
    },
    hostel: {
        active: 'border-purple-500 bg-purple-500 text-white font-bold',
        inactive: 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 font-medium',
        bg: 'bg-purple-500',
    },
    success: {
        active: 'border-emerald-500 bg-emerald-500 text-white font-bold',
        inactive: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium',
        bg: 'bg-emerald-500',
    },
    danger: {
        active: 'border-red-500 bg-red-500 text-white font-bold',
        inactive: 'border-red-200 bg-red-50 text-red-700 font-medium',
        bg: 'bg-red-500',
    },
};

// Both sizes hit the 44px touch-target minimum; "sm" only tightens
// horizontal padding for dense filter trays, never the tap height.
const SIZES = {
    sm: 'px-3 text-[11px] gap-1.5 min-h-[44px]',
    md: 'px-4 text-xs gap-2 min-h-[44px]',
};
const GAP = { sm: 'gap-1.5', md: 'gap-2' };

export default function Pill({
    active = false,
    onClick,
    children,
    icon,
    variant = 'default',
    size = 'md',
    className = '',
    layoutId,
    ...rest
}) {
    const tone = VARIANTS[variant] || VARIANTS.default;
    const useMorph = Boolean(layoutId);
    const classes = `relative overflow-hidden inline-flex items-center justify-center rounded-full border transition-colors ${SIZES[size]} ${active ? (useMorph ? 'border-transparent text-white font-bold' : tone.active) : tone.inactive} ${className}`;

    const morphBg = useMorph && active && (
        <motion.span
            layoutId={layoutId}
            className={`absolute inset-0 rounded-full -z-10 ${tone.bg}`}
            transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.6 }}
        />
    );

    const content = (
        <span className={`relative z-10 inline-flex items-center ${GAP[size]}`}>
            {icon}
            {children}
        </span>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} aria-pressed={active} className={classes} {...rest}>
                {morphBg}
                {content}
            </button>
        );
    }

    return (
        <span className={classes} {...rest}>
            {morphBg}
            {content}
        </span>
    );
}
