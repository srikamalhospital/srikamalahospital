/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx,html}",
      "./src/components/**/*.{jsx,js}",
      "./src/pages/**/*.{jsx,js}"
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          outfit: ['Outfit', 'sans-serif'],
          serif: ['"Playfair Display"', 'serif'],
        },
        colors: {
          primary: '#0ea5e9', // Clinical Blue
          secondary: '#10b981', // Emerald Health
          accent: '#6366f1', // Indigo Insight
          hospital: {
            primary: '#0ea5e9',
            secondary: '#10b981',
            dark: '#020617',
            slate: '#64748b',
            background: '#ffffff',
            surface: '#f8fafc',
            mint: '#f0fdf4',
          }
        },
        boxShadow: {
            'clinical': '0 10px 40px -10px rgba(14, 165, 233, 0.15)',
            'premium': '0 25px 60px -15px rgba(2, 6, 23, 0.12)',
            'glass': '0 8px 32px 0 rgba(14, 165, 233, 0.08)',
            'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
        },
        animation: {
          'float': 'float 10s ease-in-out infinite alternate',
          'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
          'spin-slow': 'spin 40s linear infinite',
          'slow-bounce': 'bounce 4s infinite',
        },
        keyframes: {
          float: {
            '0%': { transform: 'translateY(0) scale(1) rotate(0deg)' },
            '100%': { transform: 'translateY(-30px) scale(1.02) rotate(2deg)' },
          },
          'pulse-soft': {
            '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
            '50%': { opacity: '0.4', transform: 'scale(1.1)' },
          }
        }
      },
    },
    plugins: [],
}
