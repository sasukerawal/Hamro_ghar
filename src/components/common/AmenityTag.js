import React from 'react';
import Pill from './Pill';

/**
 * AmenityTag - A styled tag for displaying property amenities.
 * Thin wrapper over the shared Pill component so amenity display stays
 * visually identical to every other chip/pill in the app (DESIGN.md §5).
 *
 * @param {Object} props
 * @param {boolean} props.active - Whether the amenity is present.
 * @param {React.ReactNode} props.children - The name or icon of the amenity.
 */
const AmenityTag = ({ active, children }) => (
    <Pill active={active} size="sm">
        {children}
    </Pill>
);

export default React.memo(AmenityTag);
