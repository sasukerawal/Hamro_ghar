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
   * nepali: Ropani-Aana-Paisa-Daam 
   * international: SqFt
   */
  const formatArea = (landData, sqftFallback) => {
    if (!landData && !sqftFallback) return "N/A";

    const { ropani = 0, aana = 0, paisa = 0, daam = 0, totalSqFt = 0 } = landData || {};

    if (unitSystem === "nepali") {
       const parts = [];
       if (ropani > 0) parts.push(`${ropani} Ropani`);
       if (aana > 0) parts.push(`${aana} Aana`);
       if (paisa > 0) parts.push(`${paisa} Paisa`);
       if (daam > 0) parts.push(`${daam} Daam`);
       
       if (parts.length > 0) return parts.join(" ");
       if (sqftFallback) return `${sqftFallback} SqFt`;
       return "N/A";
    } else {
       // Convert Aana to SqFt if totalSqFt is not defined but Aana is
       let finalSqft = totalSqFt || sqftFallback || 0;
       if (!finalSqft && (ropani > 0 || aana > 0)) {
          // 1 Aana = 342.25 sqft
          // 1 Ropani = 16 aana
          const totalAana = (ropani * 16) + aana + (paisa / 4);
          finalSqft = totalAana * 342.25;
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
