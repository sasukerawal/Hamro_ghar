// src/components/common/LoadingState.js
import React from 'react';
import { Loader } from 'lucide-react';

/**
 * LoadingState — the single spinner treatment for the app. Every page was
 * previously rolling its own (raw <div> spinners, pulsing text with no
 * icon, different wording) — this is the one to reach for instead.
 *
 * @param {'page'|'inline'} variant - 'page' centers in a tall min-height
 *   block (route-level loads); 'inline' sits compactly within existing
 *   content (a panel, a list, a button-adjacent area).
 */
export default function LoadingState({ label = 'Loading…', variant = 'page', className = '' }) {
    if (variant === 'inline') {
        return (
            <div className={`flex items-center justify-center gap-2 py-6 text-sm text-slate-500 ${className}`} role="status">
                <Loader className="h-4 w-4 animate-spin text-gold-600" />
                <span>{label}</span>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col items-center justify-center gap-3 min-h-[50vh] text-slate-500 ${className}`} role="status">
            <Loader className="h-8 w-8 animate-spin text-gold-600" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}
