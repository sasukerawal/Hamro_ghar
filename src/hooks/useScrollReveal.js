// src/hooks/useScrollReveal.js
import { useEffect, useRef, useState } from "react";

/**
 * Progressive-enhancement scroll reveal. Content is visible by default —
 * the observer only adds a class once the element enters the viewport,
 * so JS failures, no-IntersectionObserver browsers, and screen readers
 * never lose content (per impeccable's animate.md: reveals must enhance
 * an already-visible default, never gate visibility).
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = "0px 0px -60px 0px" } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}
