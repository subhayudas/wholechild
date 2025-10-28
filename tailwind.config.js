/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
  safelist: [
    // Colors for developmental areas and other dynamic classes
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-500', 'bg-blue-600', 'bg-blue-800',
    'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'border-blue-200', 'border-blue-300',
    
    'bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-500', 'bg-green-600', 'bg-green-800',
    'text-green-600', 'text-green-700', 'text-green-800', 'text-green-900',
    'border-green-200', 'border-green-300',
    
    'bg-purple-50', 'bg-purple-100', 'bg-purple-200', 'bg-purple-500', 'bg-purple-600', 'bg-purple-800',
    'text-purple-600', 'text-purple-700', 'text-purple-800', 'text-purple-900',
    'border-purple-200', 'border-purple-300',
    
    'bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-500', 'bg-orange-600', 'bg-orange-800',
    'text-orange-600', 'text-orange-700', 'text-orange-800', 'text-orange-900',
    'border-orange-200', 'border-orange-300',
    
    'bg-pink-50', 'bg-pink-100', 'bg-pink-200', 'bg-pink-500', 'bg-pink-600', 'bg-pink-800',
    'text-pink-600', 'text-pink-700', 'text-pink-800', 'text-pink-900',
    'border-pink-200', 'border-pink-300',
    
    'bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-500', 'bg-red-600', 'bg-red-800',
    'text-red-600', 'text-red-700', 'text-red-800', 'text-red-900',
    'border-red-200', 'border-red-300',
    
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-800',
    'text-yellow-600', 'text-yellow-700', 'text-yellow-800', 'text-yellow-900',
    'border-yellow-200', 'border-yellow-300',
    
    'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-800',
    'text-indigo-600', 'text-indigo-700', 'text-indigo-800', 'text-indigo-900',
    'border-indigo-200', 'border-indigo-300',
    
    'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-800',
    'text-cyan-600', 'text-cyan-700', 'text-cyan-800', 'text-cyan-900',
    'border-cyan-200', 'border-cyan-300',
    
    // Methodology gradients
    'from-blue-500', 'to-blue-600',
    'from-green-500', 'to-green-600',
    'from-purple-500', 'to-purple-600',
    'from-orange-500', 'to-orange-600',
    'from-pink-500', 'to-pink-600',
    'from-yellow-500', 'to-orange-600',
    'from-cyan-500', 'to-blue-600',
    'from-purple-600', 'to-blue-600'
  ]
};