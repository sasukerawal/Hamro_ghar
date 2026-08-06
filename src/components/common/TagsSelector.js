// src/components/common/TagsSelector.js
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Controlled tag picker: selected tags float into a scrollable tray up top,
 * remaining options sit in a pool below. Shared layoutId animations let a
 * tag glide between the two instead of popping in/out.
 *
 * @param {{id: string, label: string, icon?: React.ReactNode}[]} options
 * @param {string[]} value - selected option ids
 * @param {(next: string[]) => void} onChange
 */
export default function TagsSelector({ options, value = [], onChange, label }) {
  const trayRef = useRef(null);
  const selected = options.filter((o) => value.includes(o.id));
  const available = options.filter((o) => !value.includes(o.id));

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  useEffect(() => {
    if (trayRef.current) {
      trayRef.current.scrollTo({ left: trayRef.current.scrollWidth, behavior: "smooth" });
    }
  }, [value.length]);

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
          {label}
        </label>
      )}

      {selected.length > 0 && (
        <motion.div
          layout
          ref={trayRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-blue-50 border border-blue-100 rounded-2xl p-2 min-h-[3.25rem]"
        >
          {selected.map((tag) => (
            <motion.div
              key={tag.id}
              layoutId={`tag-${tag.id}`}
              className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-gold-500 text-white shadow-sm rounded-full shrink-0"
            >
              {tag.icon && <span className="text-sm leading-none">{tag.icon}</span>}
              <motion.span
                layoutId={`tag-${tag.id}-label`}
                className="text-xs font-bold whitespace-nowrap"
              >
                {tag.label}
              </motion.span>
              <button
                type="button"
                onClick={() => toggle(tag.id)}
                aria-label={`Remove ${tag.label}`}
                className="p-1 rounded-full hover:bg-gold-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {available.length > 0 && (
        <motion.div layout className="flex flex-wrap gap-2">
          {available.map((tag) => (
            <motion.button
              key={tag.id}
              layoutId={`tag-${tag.id}`}
              type="button"
              onClick={() => toggle(tag.id)}
              aria-pressed={false}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:border-gold-400 hover:text-gold-700 transition-colors"
            >
              {tag.icon && <span className="text-sm leading-none">{tag.icon}</span>}
              <motion.span layoutId={`tag-${tag.id}-label`}>{tag.label}</motion.span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
