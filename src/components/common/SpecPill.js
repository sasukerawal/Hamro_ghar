import React from 'react';

/**
 * SpecPill - A compact, styled badge for property specifications.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display inside the pill.
 */
const SpecPill = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
        {children}
    </span>
);

export default React.memo(SpecPill);
