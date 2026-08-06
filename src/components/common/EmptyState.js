// src/components/common/EmptyState.js
import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — the single "nothing here" treatment. Previously each page
 * (Admin, Membership, the map view, listing utils) rendered its own plain
 * <p> or bespoke block for this; this is the one shared version.
 *
 * @param {React.ComponentType} icon - lucide-react icon component, defaults to Inbox.
 * @param {string} title
 * @param {string} [text]
 * @param {React.ReactNode} [action] - optional CTA rendered below the text.
 */
export default function EmptyState({ icon: Icon = Inbox, title, text, action, className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center text-center gap-2 py-12 px-6 ${className}`}>
            <Icon className="h-8 w-8 text-slate-300 mb-1" aria-hidden="true" />
            <p className="text-sm font-bold text-slate-700">{title}</p>
            {text && <p className="text-sm text-slate-500 max-w-xs">{text}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
