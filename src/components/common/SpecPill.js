import React from 'react';
import Pill from './Pill';

/**
 * SpecPill - A compact, styled badge for property specifications.
 * Thin wrapper over the shared Pill component (DESIGN.md §5) so spec
 * badges stay visually identical to every other chip/pill in the app.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display inside the pill.
 */
const SpecPill = ({ children }) => (
    <Pill size="sm">
        {children}
    </Pill>
);

export default React.memo(SpecPill);
