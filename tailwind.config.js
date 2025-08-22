import plugin from 'tailwindcss/plugin';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        azure: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.6)' },
        }
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      const newUtilities = {
        '.fluid-h1': {
          fontSize: 'clamp(1.9rem, 5.5vw + 0.2rem, 4.5rem)',
          lineHeight: '1.05',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        },
        '.fluid-h2': {
          fontSize: 'clamp(1.5rem, 4.2vw + 0.2rem, 3rem)',
          lineHeight: '1.15',
          fontWeight: '700',
          letterSpacing: '-0.01em'
        },
        '.fluid-h3': {
          fontSize: 'clamp(1.25rem, 3.2vw + 0.2rem, 2.25rem)',
          lineHeight: '1.25',
          fontWeight: '600'
        },
        '.fluid-body': {
          fontSize: 'clamp(0.95rem, 1.2vw + 0.5rem, 1.125rem)',
          lineHeight: '1.6'
        }
      };
      addUtilities(newUtilities, ['responsive']);
    })
  ],
}