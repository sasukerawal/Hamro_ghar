import React from 'react';

/**
 * FacilitiesStep - Fourth step of the property posting form.
 */
const FacilitiesStep = ({ formData, setFormData }) => {
    const toggleFacility = (field) => {
        setFormData(prev => ({
            ...prev,
            facilities: {
                ...prev.facilities,
                [field]: !prev.facilities?.[field]
            }
        }));
    };

    const handleCountChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            facilities: {
                ...prev.facilities,
                [field]: parseInt(value) || 0
            }
        }));
    };

    const amenities = [
        { label: "Garden", icon: "🏡" },
        { label: "Internet / WiFi", icon: "🌐" },
        { label: "Fenced", icon: "🚧" },
        { label: "Gym", icon: "🏋️" },
        { label: "Pool", icon: "🏊" },
        { label: "Lift", icon: "🛗" },
        { label: "Security Guard", icon: "👮" },
        { label: "Generator / Inverter", icon: "⚡" },
    ];

    const handleAmenityToggle = (amenity) => {
        setFormData(prev => {
            const current = prev.amenities || [];
            const updated = current.includes(amenity)
                ? current.filter(a => a !== amenity)
                : [...current, amenity];
            return { ...prev, amenities: updated };
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Bike Parking (Count)</label>
                    <input
                        type="number"
                        value={formData.facilities?.bikeParking || 0}
                        onChange={(e) => handleCountChange('bikeParking', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Car Parking (Count)</label>
                    <input
                        type="number"
                        value={formData.facilities?.carParking || 0}
                        onChange={(e) => handleCountChange('carParking', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Water Facilities</label>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: 'drinkingWater', label: 'Drinking Water' },
                        { id: 'boringWater', label: 'Boring Water' },
                        { id: 'drainage', label: 'Main Drainage' },
                        { id: 'solarWater', label: 'Solar Water' },
                    ].map((fac) => (
                        <button
                            key={fac.id}
                            type="button"
                            onClick={() => toggleFacility(fac.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${formData.facilities?.[fac.id]
                                    ? 'border-gold-400 bg-blue-50 text-gold-700 font-bold'
                                    : 'border-slate-200 bg-white text-slate-400 font-medium'
                                }`}
                        >
                            <span className="text-sm">{fac.label}</span>
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.facilities?.[fac.id] ? 'border-gold-400 bg-gold-400' : 'border-slate-200'
                                }`}>
                                {formData.facilities?.[fac.id] && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Additional Amenities</label>
                <div className="flex flex-wrap gap-2">
                    {amenities.map((item) => {
                        const isSelected = (formData.amenities || []).includes(item.label);
                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleAmenityToggle(item.label)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all ${isSelected
                                        ? 'border-gold-500 bg-gold-500 text-white font-bold'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 font-medium'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(FacilitiesStep);
