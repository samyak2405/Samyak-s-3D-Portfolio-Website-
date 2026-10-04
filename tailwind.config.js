/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Gamer + coder dark theme. `ink` = dark surfaces, `steel` = light text.
        ink: {
          DEFAULT: '#0A0B0D', // page background (deep near-black)
          2: '#14161A', // panel
          3: '#1C1F24', // elevated card
        },
        steel: {
          100: '#F4F5F7', // headings (near-white)
          200: '#E8EAED', // body
          300: '#AEB3BD', // secondary
          400: '#878C98', // muted
          500: '#656B78', // faint / decorative
          600: '#2A2E36', // hairline-ish
        },
        // Primary neon: electric blue.
        accent: {
          DEFAULT: '#4D8BFF',
          strong: '#6AA0FF',
          // Darker blue for solid fills behind white text (passes WCAG AA).
          deep: '#2E6AE6',
          soft: 'rgba(77,139,255,0.14)',
          dim: 'rgba(77,139,255,0.10)',
        },
        // Secondary neon: magenta/violet (token kept as `amber` so existing
        // usages become the secondary accent with no churn).
        amber: {
          DEFAULT: '#C65CFF',
          strong: '#D583FF',
          soft: 'rgba(198,92,255,0.14)',
        },
        focus: {
          DEFAULT: '#0C0E14',
          2: '#12151D',
        },
        hairline: 'rgba(255,255,255,0.08)',
        'hairline-strong': 'rgba(255,255,255,0.14)',
      },
      fontFamily: {
        display: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
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
        'glow-blue': '0 0 0 1px rgba(77,139,255,0.4), 0 0 22px rgba(77,139,255,0.28)',
        'glow-magenta': '0 0 0 1px rgba(198,92,255,0.4), 0 0 22px rgba(198,92,255,0.24)',
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
