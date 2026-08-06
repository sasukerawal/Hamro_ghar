import React from 'react';

/**
 * StatCard - Displays a single metric on the homepage with a premium glass effect.
 */
const StatCard = ({ label, value, icon }) => (
    <div className="glass group relative overflow-hidden p-6 rounded-[2rem] flex items-center gap-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-default border border-white/50">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-gold-500/5 transition-colors duration-300" />

        <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-gold-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            {icon}
        </div>

        <div className="relative">
            <p className="text-3xl font-black text-slate-900 leading-none mb-1 tracking-tighter transition-colors group-hover:text-blue-600 uppercase">{value}</p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">{label}</p>
        </div>
    </div>
);

export default React.memo(StatCard);
