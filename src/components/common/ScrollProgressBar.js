// src/components/common/ScrollProgressBar.js
// Thin fixed bar under the header tracking read/scroll progress down the
// current page. Mounted once at the App root so it's present everywhere —
// most useful on long pages (property detail, post-listing wizard) but
// harmless (and honest — 0% at top) on short ones too.
import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  // Spring-smoothed so it glides rather than jumping frame-to-frame with
  // native scroll — MotionConfig's reducedMotion="user" (set at the App
  // root) automatically disables this for prefers-reduced-motion users.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-16 lg:top-20 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-gold-400 via-gold-500 to-gold-700 z-[90] pointer-events-none"
      aria-hidden="true"
    />
  );
}
