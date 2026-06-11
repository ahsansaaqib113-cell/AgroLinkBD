/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables selector-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          50: '#22c55e',
          500: '#10b981', // Emerald green
          600: '#059669', // Medium green
          700: '#047857', // Dark forest green
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          light: '#f59e0b', // Amber rating star
          DEFAULT: '#84cc16', // Lime green highlight
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-hover': '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
