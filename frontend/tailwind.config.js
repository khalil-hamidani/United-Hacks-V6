/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#050507',
        obsidian: '#08080A',
        lavender: {
          DEFAULT: '#5B21B6',
          glow: 'rgba(91, 33, 182, 0.3)',
        },
        glass: 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.7s ease-out',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      transitionDuration: {
        '500': '500ms',
        '700': '700ms',
      },
      backdropBlur: {
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 30px -5px rgba(91, 33, 182, 0.3)',
        'glow-lg': '0 0 60px -10px rgba(91, 33, 182, 0.4)',
      },
    },
  },
  plugins: [],
}
