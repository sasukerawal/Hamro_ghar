import React, { createContext, useContext, useState, useEffect } from "react";

const MeasurementContext = createContext();

export function MeasurementProvider({ children }) {
  // Try to load user preference from localStorage, default to 'nepali'
  const [unitSystem, setUnitSystem] = useState(() => {
    return localStorage.getItem("hg_unit_system") || "nepali";
  });

  useEffect(() => {
    localStorage.setItem("hg_unit_system", unitSystem);
  }, [unitSystem]);

  const toggleUnitSystem = () => {
    setUnitSystem((prev) => (prev === "nepali" ? "international" : "nepali"));
  };

  /**
   * Format Price 
   * nepali: Lakhs / Crores 
   * international: Millions / Thousands
   */
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rs. 0";

    if (unitSystem === "nepali") {
      if (price >= 10000000) {
        return `Rs. ${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
      } else if (price >= 100000) {
        return `Rs. ${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
      } else {
        return `Rs. ${price.toLocaleString('en-IN')}`;
      }
    } else {
      // International
      if (price >= 1000000) {
        return `Rs. ${(price / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
      } else if (price >= 1000) {
        return `Rs. ${(price / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      } else {
        return `Rs. ${price.toLocaleString('en-US')}`;
      }
    }
  };

  /**
   * Format Area
   * nepali: Ropani-Aana-Paisa-Daam (hills) OR Bigha-Katha-Dhur (terai)
   * international: SqFt
   */
  const formatArea = (landData, sqftFallback) => {
    if (!landData && !sqftFallback) return "N/A";

    const {
      ropani = 0, aana = 0, paisa = 0, daam = 0,
      bigha = 0, katha = 0, dhur = 0,
      unitSystem: landUnitSystem = '',
      totalSqFt = 0
    } = landData || {};

    const isTerai = landUnitSystem === 'terai' || (bigha > 0 || katha > 0 || dhur > 0);

    if (unitSystem === "nepali") {
      if (isTerai) {
        // Display in Bigha-Katha-Dhur
        const parts = [];
        if (bigha > 0) parts.push(`${bigha} Bigha`);
        if (katha > 0) parts.push(`${katha} Katha`);
        if (dhur > 0) parts.push(`${dhur} Dhur`);
        if (parts.length > 0) return parts.join(" ");
      }
      // Display in Ropani-Aana-Paisa-Daam
      const parts = [];
      if (ropani > 0) parts.push(`${ropani} Ropani`);
      if (aana > 0) parts.push(`${aana} Aana`);
      if (paisa > 0) parts.push(`${paisa} Paisa`);
      if (daam > 0) parts.push(`${daam} Daam`);

      if (parts.length > 0) return parts.join(" ");
      if (sqftFallback) return `${sqftFallback} SqFt`;
      return "N/A";
    } else {
      // International → always SqFt
      let finalSqft = totalSqFt || sqftFallback || 0;
      if (!finalSqft) {
        if (isTerai) {
          // 1 Bigha = 72,900 sqft, 1 Katha = 3,645 sqft, 1 Dhur = 182.25 sqft
          finalSqft = bigha * 72900 + katha * 3645 + dhur * 182.25;
        } else if (ropani > 0 || aana > 0) {
          // 1 Ropani = 16 Aana, 1 Aana = 342.25 sqft
          const totalAana = (ropani * 16) + aana + (paisa / 4);
          finalSqft = totalAana * 342.25;
        }
      }

      if (finalSqft > 0) {
        return `${Math.round(finalSqft).toLocaleString('en-US')} SqFt`;
      }
      return "N/A";
    }
  };

  return (
    <MeasurementContext.Provider value={{ unitSystem, toggleUnitSystem, formatPrice, formatArea }}>
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurement() {
  return useContext(MeasurementContext);
}
