/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Spider-Man night theme. `ink` = navy-black night surfaces, `steel` = light text.
        ink: {
          DEFAULT: '#07080F', // page background (night sky, a touch of navy)
          2: '#0F121C', // panel
          3: '#161A26', // elevated card
        },
        steel: {
          100: '#F4F5F7', // headings (near-white)
          200: '#E8EAED', // body
          300: '#AEB3BD', // secondary
          400: '#878C98', // muted
          500: '#656B78', // faint / decorative
          600: '#2A2E36', // hairline-ish
        },
        // Primary: suit red.
        accent: {
          DEFAULT: '#FF3B4A',
          strong: '#FF5C69',
          // Darker red for solid fills behind white text (passes WCAG AA).
          deep: '#D0102A',
          soft: 'rgba(255,59,74,0.14)',
          dim: 'rgba(255,59,74,0.10)',
        },
        // Secondary: suit blue (token kept as `amber` so existing usages
        // become the secondary accent with no churn).
        amber: {
          DEFAULT: '#4D8BFF',
          strong: '#6AA0FF',
          soft: 'rgba(77,139,255,0.14)',
        },
        focus: {
          DEFAULT: '#0A0D18',
          2: '#101421',
        },
        hairline: 'rgba(255,255,255,0.08)',
        'hairline-strong': 'rgba(255,255,255,0.14)',
      },
      // Families resolve through CSS variables (defined in index.css) so the
      // whole site can be re-skinned from one place.
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      maxWidth: {
        content: '1240px',
      },
      letterSpacing: {
        label: '0.2em',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.4)',
        lift: '0 10px 34px rgba(0,0,0,0.55)',
        'glow-primary': '0 0 0 1px rgba(255,59,74,0.45), 0 0 22px rgba(255,59,74,0.3)',
        'glow-secondary': '0 0 0 1px rgba(77,139,255,0.4), 0 0 22px rgba(77,139,255,0.26)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        blink: {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
        blink: 'blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [],
}
