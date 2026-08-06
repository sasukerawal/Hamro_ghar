// src/components/common/Ripple.js
// Material-style tap feedback: a ring expands from the exact press point
// and fades out. Purely a `useRipple()` hook + layer so it drops into any
// existing button without touching its visual design — the caller just
// adds `relative overflow-hidden`, spreads `onPointerDown`, and renders
// `rippleLayer` as a child.
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";

let rippleId = 0;

export function useRipple() {
  const [ripples, setRipples] = useState([]);

  const onPointerDown = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const id = rippleId++;
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  const rippleLayer = (
    <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none" aria-hidden="true">
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            marginLeft: -r.size / 2,
            marginTop: -r.size / 2,
            borderRadius: "9999px",
            background: "currentColor",
          }}
        />
      ))}
    </span>
  );

  return { onPointerDown, rippleLayer };
}
