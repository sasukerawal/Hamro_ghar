import React from 'react';
import { Image as ImageIcon, X, Plus, Loader } from 'lucide-react';

/**
 * MediaStep - Fifth step of the property posting form.
 */
const MediaStep = ({ images, setImages, onFileSelect, uploadLoading }) => {
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-gold-300 hover:bg-blue-50/20 transition-all relative">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadLoading}
                />
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${uploadLoading ? 'bg-slate-100' : 'bg-white shadow-xl shadow-slate-200 group-hover:scale-110'
                    }`}>
                    {uploadLoading ? (
                        <Loader className="h-8 w-8 text-gold-600 animate-spin" />
                    ) : (
                        <ImageIcon className="h-8 w-8 text-gold-600" />
                    )}
                </div>
                <p className="text-base font-black text-slate-900 mb-1">
                    {uploadLoading ? 'Uploading...' : 'Click or Drag Photos'}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                    Upload up to 10 high-quality JPG or PNG images. (Max 8MB per file)
                </p>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group border border-slate-100 shadow-sm">
                            <img
                                src={img.url || img}
                                alt={`Listing upload ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                aria-label={`Remove photo ${idx + 1}`}
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            {idx === 0 && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-gold-500 text-white text-[9px] font-black uppercase tracking-wider">
                                    Main Photo
                                </div>
                            )}
                        </div>
                    ))}
                    {images.length < 10 && (
                        <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-gold-400 hover:border-blue-200 transition-all cursor-pointer relative">
                            <input type="file" multiple accept="image/*" onChange={onFileSelect} aria-label="Add more photos" className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Plus className="h-8 w-8" aria-hidden="true" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(MediaStep);
