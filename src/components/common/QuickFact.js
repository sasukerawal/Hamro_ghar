import React from 'react';

/**
 * QuickFact - Displays a single property fact (e.g., Bedrooms, Land Area) with an icon.
 *
 * @param {Object} props
 * @param {string} props.label - Descriptive label for the fact.
 * @param {string|number} props.value - The actual value to display.
 * @param {React.ComponentType} props.icon - lucide-react icon component representing the fact.
 */
const QuickFact = ({ label, value, icon: Icon }) => {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
            {Icon && <Icon className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" aria-hidden="true" />}
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default React.memo(QuickFact);
