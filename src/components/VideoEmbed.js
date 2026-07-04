import React, { useState } from 'react';
import { PlayCircle, AlertCircle } from 'lucide-react';

export default function VideoEmbed({ url }) {
  const [error, setError] = useState(false);

  if (!url) return null;

  const getVideoSource = (link) => {
    try {
      const u = new URL(link);
      
      // YouTube Logic
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        let videoId = '';
        if (u.hostname.includes('youtu.be')) {
          videoId = u.pathname.slice(1);
        } else if (u.searchParams.has('v')) {
          videoId = u.searchParams.get('v');
        } else if (u.pathname.startsWith('/embed/')) {
          videoId = u.pathname.split('/embed/')[1];
        } else if (u.pathname.startsWith('/shorts/')) {
          videoId = u.pathname.split('/shorts/')[1];
        }
        
        if (videoId) {
           return {
             type: 'youtube',
             src: `https://www.youtube.com/embed/${videoId.split('?')[0]}?autoplay=0&rel=0`
           };
        }
      }

      // TikTok Logic (Tiktok requires a specific embed URL format)
      if (u.hostname.includes('tiktok.com')) {
         const pathParts = u.pathname.split('/');
         const videoIdIndex = pathParts.indexOf('video') + 1;
         if (videoIdIndex > 0 && pathParts[videoIdIndex]) {
            const videoId = pathParts[videoIdIndex];
            return {
               type: 'tiktok',
               src: `https://www.tiktok.com/embed/v2/${videoId}`
            };
         }
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  const videoMeta = getVideoSource(url);

  if (!videoMeta) {
    // Fallback: If it's an unrecognized URL format, just show a button to open it
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
         <PlayCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
         <h3 className="text-lg font-bold text-slate-800 mb-2">Video Walkthrough Available</h3>
         <p className="text-sm text-slate-500 mb-4">The owner has provided a video tour for this property.</p>
         <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95">
           Watch External Video
         </a>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-black relative ${videoMeta.type === 'tiktok' ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video'}`}>
       {error ? (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-500">
           <AlertCircle className="w-8 h-8 mb-2 text-rose-400" />
           <p className="text-sm font-semibold text-center px-4">Video couldn't be loaded.</p>
           <a href={url} target="_blank" rel="noreferrer" className="text-xs text-gold-700 mt-2 hover:underline">Open externally instead</a>
         </div>
       ) : (
         <iframe
           src={videoMeta.src}
           title="Property Video Tour"
           className="w-full h-full absolute top-0 left-0"
           frameBorder="0"
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
           allowFullScreen
           onError={() => setError(true)}
         />
       )}
    </div>
  );
}
