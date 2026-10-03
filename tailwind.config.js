/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Single dark theme. One accent (amber) locked across the whole page.
        ink: {
          DEFAULT: '#0A0B0D', // page background
          2: '#0E1014', // panels
          3: '#141820', // elevated surfaces
        },
        steel: {
          // neutral cool greys — the "structure" of the system
          100: '#E7E9EC',
          200: '#C3C8CF',
          300: '#9BA1AA',
          400: '#6B7280',
          500: '#4A5058',
          600: '#2A2E35',
        },
        accent: {
          DEFAULT: '#E6A84B', // warm gold — "the money running through the system"
          strong: '#F4BB63',
          dim: 'rgba(230,168,75,0.12)',
        },
        hairline: 'rgba(255,255,255,0.08)',
        'hairline-strong': 'rgba(255,255,255,0.15)',
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
      letterSpacing: {
        label: '0.22em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
      },
    },
  },
  plugins: [],
}
