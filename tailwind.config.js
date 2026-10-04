/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, light "modern office" theme.
        // `ink` = light surfaces (page/panels/cards). `steel` = text (dark -> muted).
        ink: {
          DEFAULT: '#FAF7F2', // page background (warm off-white)
          2: '#F2ECE1', // soft warm panel
          3: '#FFFFFF', // elevated card
        },
        steel: {
          100: '#211D16', // primary text (warm near-black)
          200: '#3C362C',
          300: '#5C5547', // body / secondary
          400: '#726A58', // muted (AA on paper)
          500: '#8C8470', // faint / decorative
          600: '#D8D0C2',
        },
        // Primary accent: deep blue, drawn from the character's suit.
        accent: {
          DEFAULT: '#2B4C8C',
          strong: '#35599E',
          soft: '#E7EDF8',
          dim: 'rgba(43,76,140,0.10)',
        },
        // Secondary warm accent.
        amber: {
          DEFAULT: '#DD8420',
          strong: '#C9741A',
          soft: '#FBEEDA',
        },
        // Dark "focus" sections for rhythm/contrast.
        focus: {
          DEFAULT: '#16233E',
          2: '#1E2F50',
        },
        hairline: 'rgba(31,27,20,0.12)',
        'hairline-strong': 'rgba(31,27,20,0.20)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
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
        soft: '0 1px 2px rgba(31,27,20,0.04), 0 8px 24px rgba(31,27,20,0.06)',
        lift: '0 2px 4px rgba(31,27,20,0.05), 0 18px 40px rgba(31,27,20,0.10)',
        character: '0 30px 40px -24px rgba(31,27,20,0.30)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
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
