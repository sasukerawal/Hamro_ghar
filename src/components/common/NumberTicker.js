// src/components/common/NumberTicker.js
// Counts up to a numeric value once it enters view, instead of popping in
// as static text. Non-numeric values (e.g. "—" while stats are loading)
// render as-is with no animation.
import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

export default function NumberTicker({ value, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const numericValue = typeof value === "number" ? value : Number(value);
  const isAnimatable = Number.isFinite(numericValue);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!isAnimatable || !isInView) return;
    const controls = animate(count, numericValue, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, numericValue, isAnimatable]);

  if (!isAnimatable) {
    return <span ref={ref} className={className}>{value}</span>;
  }

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
}
