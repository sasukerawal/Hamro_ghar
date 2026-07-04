import React from 'react';

/**
 * SpecsStep - Third step of the property posting form.
 */
const SpecsStep = ({ formData, setFormData, errors }) => {
    const propertyType = formData.specs?.propertyType || 'House';
    const isLand = propertyType === 'Land';

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        handleNestedChange('specs', name, value);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Land Area / Size</label>
                    <div className="flex gap-2">
                        <input
                            name="landArea"
                            type="number"
                            value={formData.specs?.landArea || ''}
                            onChange={handleChange}
                            placeholder="e.g. 3.5"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                        />
                        <select
                            name="landAreaUnit"
                            value={formData.specs?.landAreaUnit || 'Aana'}
                            onChange={handleChange}
                            className="w-24 px-2 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 bg-white font-bold"
                        >
                            <option value="Aana">Aana</option>
                            <option value="Ropani">Ropani</option>
                            <option value="Dhur">Dhur</option>
                            <option value="Katha">Katha</option>
                            <option value="Bigha">Bigha</option>
                            <option value="Sq. Ft.">Sq. Ft.</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Facing Direction</label>
                    <select
                        name="facing"
                        value={formData.specs?.facing || 'East'}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 bg-white font-bold"
                    >
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="NorthEast">North-East</option>
                        <option value="SouthEast">South-East</option>
                        <option value="NorthWest">North-West</option>
                        <option value="SouthWest">South-West</option>
                    </select>
                </div>
            </div>

            {!isLand && (
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Bedrooms</label>
                        <input
                            name="bedrooms"
                            type="number"
                            value={formData.specs?.bedrooms || ''}
                            onChange={handleChange}
                            placeholder="e.g. 4"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Bathrooms</label>
                        <input
                            name="bathrooms"
                            type="number"
                            value={formData.specs?.bathrooms || ''}
                            onChange={handleChange}
                            placeholder="e.g. 2"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Total Floors</label>
                        <input
                            name="totalFloors"
                            type="number"
                            value={formData.specs?.totalFloors || ''}
                            onChange={handleChange}
                            placeholder="e.g. 2.5"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Furnishing</label>
                        <select
                            name="furnishing"
                            value={formData.specs?.furnishing || 'Not Furnished'}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 bg-white font-bold"
                        >
                            <option value="Not Furnished">Not Furnished</option>
                            <option value="Semi Furnished">Semi Furnished</option>
                            <option value="Fully Furnished">Fully Furnished</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Road Access (Feet)</label>
                    <input
                        name="roadAccessFeet"
                        type="number"
                        value={formData.specs?.roadAccessFeet || ''}
                        onChange={handleChange}
                        placeholder="e.g. 13"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                    />
                </div>
                {!isLand && (
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Built Year</label>
                        <input
                            name="builtYear"
                            type="number"
                            value={formData.specs?.builtYear || ''}
                            onChange={handleChange}
                            placeholder="e.g. 2022"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 font-bold"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(SpecsStep);
