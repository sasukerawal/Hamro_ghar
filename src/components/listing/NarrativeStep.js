import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * NarrativeStep - Final step of the property posting form.
 */
const NarrativeStep = ({ formData, isSubmitting }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 rounded-full bg-green-100 items-center justify-center mb-2">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Almost Done!</h2>
                <p className="text-sm text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
                    Please review your details. Click "Submit Listing" to publish your property to the HamroGhar network.
                </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-6">
                <div className="flex justify-between items-baseline border-b border-slate-200 pb-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pricing</span>
                    <span className="text-xl font-black text-slate-900">Rs. {formData.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-xs font-bold">
                    <div>
                        <p className="text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Property Type</p>
                        <p className="text-slate-700">{formData.specs?.propertyType || 'House'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Listing Type</p>
                        <p className="text-slate-700">For {formData.type === 'sale' ? 'Sale' : 'Rent'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Location</p>
                        <p className="text-slate-700">{formData.city || '—'}, {formData.address || '—'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 uppercase tracking-widest mb-1 text-[9px]">Land Area</p>
                        <p className="text-slate-700">
                            {typeof formData.specs?.landArea === 'object'
                                ? `${formData.specs.landArea.ropani}-${formData.specs.landArea.aana}-${formData.specs.landArea.paisa}-${formData.specs.landArea.daam}`
                                : (formData.specs?.landArea || '—')}
                            {formData.specs?.landAreaUnit}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 italic">
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    <strong>Note:</strong> By submitting, you agree to our terms of service and confirm that the information provided is accurate to the best of your knowledge.
                </p>
            </div>

            {isSubmitting && (
                <div className="flex flex-col items-center gap-3 py-4 text-gold-700">
                    <div className="h-6 w-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest">Publishing Listing...</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(NarrativeStep);
