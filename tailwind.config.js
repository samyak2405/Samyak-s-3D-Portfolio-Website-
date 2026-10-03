/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep indigo-tinted dark theme. Editorial, near-monochrome, with one
        // sparing warm accent (amber) as Samyak's signature.
        ink: {
          DEFAULT: '#09090F', // page background (indigo-black)
          2: '#0D0D16', // panels
          3: '#13131F', // elevated surfaces
        },
        // Lilac-leaning neutrals (token name kept as `steel` across the codebase).
        steel: {
          100: '#ECEBF3',
          200: '#C6C4D7',
          300: '#9A98AF',
          400: '#6C6A82',
          500: '#48465E',
          600: '#262532',
        },
        accent: {
          DEFAULT: '#E6A84B', // warm gold, used sparingly
          strong: '#F4BB63',
          dim: 'rgba(230,168,75,0.12)',
        },
        hairline: 'rgba(255,255,255,0.09)',
        'hairline-strong': 'rgba(255,255,255,0.16)',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        content: '1320px',
      },
      letterSpacing: {
        label: '0.22em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'draw-x': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'draw-y': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'draw-x': 'draw-x 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        'draw-y': 'draw-y 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
      },
    },
  },
  plugins: [],
}
