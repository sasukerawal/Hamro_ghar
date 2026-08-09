// src/OurStory.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, Home, X } from "lucide-react";

// One-time, full-screen brand story sequence — deliberately NOT wired into
// normal page scroll. Wheel/keyboard/touch are only captured while this
// region is focused, and every takeover has a visible escape route (Skip,
// dot nav, prev/next) so it never traps navigation or breaks back-behavior.
const PANELS = [
  {
    // `label` is assistive-tech-only context (aria-label on the dot nav),
    // never rendered as a visible kicker above the heading — that's a
    // banned pattern regardless of content. The heading carries the panel.
    label: "Welcome",
    heading: "Renting in Nepal shouldn't feel like a gamble.",
    body:
      "Hamro Ghar exists because finding a home — or a tenant — has relied on word of mouth, brokers, and blind trust for far too long.",
    tone: "dark",
  },
  {
    label: "No Middlemen",
    heading: "No brokers. No hidden dalali fees.",
    body:
      "You talk directly to the owner or the seeker. What you see is what you pay — nothing tacked on at the door.",
    tone: "accent",
  },
  {
    label: "Verified",
    heading: "Every listing carries our verification stamp.",
    body:
      "Ownership, location, and photos are checked before a listing goes live, so you can trust what you're looking at.",
    tone: "dark",
  },
  {
    label: "Both Sides",
    heading: "Built equally for seekers and owners.",
    body:
      "Whether you're hunting for a room in Kathmandu or listing your ghar in Pokhara, the experience is built for you specifically.",
    tone: "accent",
  },
  {
    label: "Your Turn",
    heading: "Your next home is closer than you think.",
    body: "Browse verified listings across Nepal, today.",
    tone: "cta",
  },
];

const TONE_CLASSES = {
  dark: "bg-blue-950 text-white",
  accent: "bg-gold-500 text-white",
  cta: "bg-white text-blue-950",
};

const TRANSITION_MS = 650;

export default function OurStory() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const lockRef = useRef(false);
  const touchStartY = useRef(0);
  const navigate = useNavigate();

  const go = useCallback((dir) => {
    if (lockRef.current) return;
    setIndex((i) => {
      const next = i + dir;
      if (next < 0 || next >= PANELS.length) return i;
      lockRef.current = true;
      setTimeout(() => {
        lockRef.current = false;
      }, TRANSITION_MS);
      return next;
    });
  }, []);

  const jumpTo = useCallback((i) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setIndex(i);
    setTimeout(() => {
      lockRef.current = false;
    }, TRANSITION_MS);
  }, []);

  const onWheel = (e) => {
    e.preventDefault();
    go(e.deltaY > 0 ? 1 : -1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "Escape") {
      navigate("/");
    }
  };

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 40) go(delta > 0 ? 1 : -1);
  };

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-blue-950">
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label="Hamro Ghar story"
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative h-full w-full overflow-hidden outline-none"
      >
        {PANELS.map((panel, i) => {
          const offset = i - index;
          return (
            <div
              key={panel.heading}
              aria-hidden={offset !== 0}
              className={`absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-12 text-center transition-transform motion-reduce:transition-none ${TONE_CLASSES[panel.tone]}`}
              style={{
                transform: `translateY(${offset * 100}%)`,
                transitionDuration: `${TRANSITION_MS}ms`,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight max-w-3xl">
                {panel.heading}
              </h2>
              <p className="mt-6 text-base sm:text-lg max-w-xl opacity-90">{panel.body}</p>
              {panel.tone === "cta" && (
                <Link
                  to="/"
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg hover:bg-gold-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Browse Listings
                </Link>
              )}
            </div>
          );
        })}

        {/* Skip / close — always-visible escape route */}
        <Link
          to="/"
          className="absolute top-6 right-6 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur hover:bg-white/20 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Skip
        </Link>

        {/* Dot navigation */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
          {PANELS.map((panel, i) => (
            <button
              key={panel.heading}
              type="button"
              aria-label={`Go to section ${i + 1}: ${panel.label}`}
              aria-current={i === index}
              onClick={() => jumpTo(i)}
              className={`w-2.5 rounded-full transition-all ${
                i === index ? "bg-gold-400 h-6" : "bg-white/40 h-2.5 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Prev/Next buttons */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous section"
            disabled={index === 0}
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next section"
            disabled={index === PANELS.length - 1}
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
