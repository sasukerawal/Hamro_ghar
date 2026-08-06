import React from 'react';

/**
 * BasicDetailsStep - First step of the property posting form.
 */
const BasicDetailsStep = ({ formData, setFormData, errors }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="listingName" className="text-xs font-black text-slate-700 uppercase tracking-widest">Property Title</label>
                    <input
                        id="listingName"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="e.g. Modern Villa with Pool"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'} outline-none focus:border-gold-400 transition-all font-medium`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="listingDealType" className="text-xs font-black text-slate-700 uppercase tracking-widest">Listing Type</label>
                    <select
                        id="listingDealType"
                        name="type"
                        value={formData.type || 'sale'}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 bg-white font-medium"
                    >
                        <option value="rent">For Rent</option>
                        <option value="sale">For Sale</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="listingDescription" className="text-xs font-black text-slate-700 uppercase tracking-widest">Property Description</label>
                <textarea
                    id="listingDescription"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell buyers/renters what makes this place special..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 resize-none font-medium leading-relaxed"
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="listingPrice" className="text-xs font-black text-slate-700 uppercase tracking-widest">Price (NPR)</label>
                    <input
                        id="listingPrice"
                        name="price"
                        type="number"
                        value={formData.price || ''}
                        onChange={handleChange}
                        placeholder="e.g. 50000"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.price ? 'border-red-500 bg-red-50' : 'border-slate-200'} outline-none focus:border-gold-400 transition-all font-black`}
                    />
                    {errors.price && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="listingPropertyType" className="text-xs font-black text-slate-700 uppercase tracking-widest">Property Type</label>
                    <select
                        id="listingPropertyType"
                        name="propertyType"
                        value={formData.propertyType || 'House'}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            specs: { ...prev.specs, propertyType: e.target.value }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-gold-400 bg-white font-medium"
                    >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default React.memo(BasicDetailsStep);
