import React from 'react';
import { MapPin, Globe } from 'lucide-react';

/**
 * LocationStep - Second step of the property posting form.
 */
const LocationStep = ({ formData, setFormData, errors }) => {
    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleCityChange = (e) => {
        setFormData(prev => ({ ...prev, city: e.target.value }));
    };

    const handleMapsUrlPaste = (e) => {
        const url = e.target.value;
        handleNestedChange('location', 'mapsUrl', url);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="locCity" className="text-xs font-black text-slate-700 uppercase tracking-widest">City</label>
                    <input
                        id="locCity"
                        value={formData.city || ''}
                        onChange={handleCityChange}
                        placeholder="e.g. Kathmandu"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-500 bg-red-50' : 'border-slate-200'} outline-none focus:border-gold-400 transition-all font-bold`}
                    />
                    {errors.city && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="locDistrict" className="text-xs font-black text-slate-700 uppercase tracking-widest">District</label>
                    <input
                        id="locDistrict"
                        value={formData.location?.district || ''}
                        onChange={(e) => handleNestedChange('location', 'district', e.target.value)}
                        placeholder="e.g. Lalitpur"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="locAddress" className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Address / Municipality
                </label>
                <input
                    id="locAddress"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. Ward 4, Sukedhara"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50' : 'border-slate-200'} outline-none focus:border-gold-400 transition-all font-medium`}
                />
                {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">{errors.address}</p>}
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-blue-900 leading-none">Precise Map Location</p>
                    <p className="text-xs text-gold-700 font-medium leading-relaxed">
                        Paste a Google Maps link. We automatically extract coordinates (Latitude & Longitude) to show your home to nearby buyers.
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="locMapsUrl" className="text-xs font-black text-slate-700 uppercase tracking-widest">Google Maps URL</label>
                <input
                    id="locMapsUrl"
                    value={formData.location?.mapsUrl || ''}
                    onChange={handleMapsUrlPaste}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 placeholder:text-slate-300 font-medium"
                />
            </div>
        </div>
    );
};

export default React.memo(LocationStep);
