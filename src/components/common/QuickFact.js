import React from 'react';

/**
 * QuickFact - Displays a single property fact (e.g., Bedrooms, Land Area) with an icon.
 * 
 * @param {Object} props
 * @param {string} props.label - Descriptive label for the fact.
 * @param {string|number} props.value - The actual value to display.
 * @param {string} props.icon - Emoji or icon representing the fact.
 */
const QuickFact = ({ label, value, icon }) => {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
            <span className="text-xl leading-none pt-0.5" role="img" aria-label={label}>
                {icon}
            </span>
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
