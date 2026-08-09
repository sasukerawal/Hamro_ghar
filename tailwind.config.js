/** @type {import('tailwindcss').Config} */
module.exports = {
  // Make sure Tailwind sees classes everywhere you use them
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./*.{js,jsx}" // root-level App.js, index.js
  ],
  theme: {
    extend: {
      colors: {
        // Brand ink — warm espresso instead of cold navy-black. Overrides
        // Tailwind's stock blue scale so every remaining blue-* usage
        // across the app (post-listing wizard, membership, profile,
        // chat, etc.) picks up the same warm neutral automatically.
        // Deliberately NOT a pale cream/sand background token — warmth
        // comes from this ink + the terracotta accent below, not from
        // tinting the page canvas (see DESIGN.md's cream-background ban).
        blue: {
          50: '#FAF8F6',
          100: '#F3EFEB',
          200: '#E5DFD8',
          300: '#C9C0B5',
          400: '#A69A8C',
          500: '#837868',
          600: '#6B6259',
          700: '#57504A',
          800: '#3D3833',
          900: '#2B211A',
          950: '#1A1410',
        },
        // Accent — warm terracotta, grounded in Kathmandu Valley fired-brick
        // architecture. Unlike the gold it replaces, terracotta is dark
        // enough to pair with white text directly (5:1+), so button text
        // stays white rather than needing dark-on-light for contrast.
        gold: {
          50: '#FBF1EC',
          100: '#F6DFD2',
          200: '#EBBFA3',
          300: '#DB9A74',
          400: '#C97850',
          500: '#B4522F',
          600: '#9C4526',
          700: '#7D3720',
          800: '#632C1A',
          900: '#4F2415',
          950: '#2E1409',
        },
        // Secondary warm accent — a richer marigold/copper sitting between
        // terracotta and pure gold, grounded in the same fired-brick /
        // Kathmandu-dusk world. Reserved for gradient depth and atmospheric
        // glow (hero/CTA backgrounds, premium-card highlights) — never for
        // button fills, body text, or anything already using `gold-*`, so
        // every contrast pairing verified this session stays untouched.
        ember: {
          300: '#F0BB6B',
          400: '#E8A33D',
          500: '#D9822E',
          600: '#A5551C',
          700: '#8A4517',
          800: '#6B3512',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-up-down': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'scale-up-down': 'scale-up-down 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
