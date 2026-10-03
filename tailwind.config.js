/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0C0C0C',
        panel: '#121212',
        hairline: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Kanit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        chrome: 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
        accent: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
