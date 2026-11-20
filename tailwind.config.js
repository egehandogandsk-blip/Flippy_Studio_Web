/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        flippy: {
          bg: '#040507',
          surface: '#0a0b0e',
          border: 'rgba(255,255,255,0.1)',
          blue: '#0047FF',
          cyan: '#00C2FF',
        },
      },
    },
  },
  plugins: [],
};
