import React from 'react';
import { TreePine, Wifi, Fence, Dumbbell, Waves, ArrowUpDown, ShieldCheck, Zap } from 'lucide-react';
import TagsSelector from '../common/TagsSelector';

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
        { label: "Garden", icon: TreePine },
        { label: "Internet / WiFi", icon: Wifi },
        { label: "Fenced", icon: Fence },
        { label: "Gym", icon: Dumbbell },
        { label: "Pool", icon: Waves },
        { label: "Lift", icon: ArrowUpDown },
        { label: "Security Guard", icon: ShieldCheck },
        { label: "Generator / Inverter", icon: Zap },
    ];

    const amenityOptions = amenities.map((item) => {
        const Icon = item.icon;
        return {
            id: item.label,
            label: item.label,
            icon: <Icon className="h-3.5 w-3.5" />,
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="bikeParking" className="text-xs font-black text-slate-700 uppercase tracking-widest">Bike Parking (Count)</label>
                    <input
                        id="bikeParking"
                        type="number"
                        value={formData.facilities?.bikeParking || 0}
                        onChange={(e) => handleCountChange('bikeParking', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="carParking" className="text-xs font-black text-slate-700 uppercase tracking-widest">Car Parking (Count)</label>
                    <input
                        id="carParking"
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
                            aria-pressed={!!formData.facilities?.[fac.id]}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all min-h-[44px] ${formData.facilities?.[fac.id]
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

            <TagsSelector
                label="Additional Amenities"
                options={amenityOptions}
                value={formData.amenities || []}
                onChange={(amenities) => setFormData(prev => ({ ...prev, amenities }))}
            />
        </div>
    );
};

export default React.memo(FacilitiesStep);
