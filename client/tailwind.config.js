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
          sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
          display: ['Figtree', '"Noto Sans"', 'system-ui', 'sans-serif'],
          telugu: ['"Noto Sans Telugu"', 'sans-serif'],
        },
        colors: {
          primary: 'rgb(var(--hospital-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--hospital-secondary-rgb) / <alpha-value>)',
          accent: 'rgb(var(--hospital-accent-rgb) / <alpha-value>)',
          hospital: {
            primary: 'rgb(var(--hospital-primary-rgb) / <alpha-value>)',
            secondary: 'rgb(var(--hospital-secondary-rgb) / <alpha-value>)',
            accent: 'rgb(var(--hospital-accent-rgb) / <alpha-value>)',
            dark: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
            slate: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
            background: 'var(--page-bg)',
            surface: 'var(--card-bg)',
            mint: 'var(--page-bg)',
          }
        },
        boxShadow: {
            'clinical': '0 10px 40px -12px rgba(8, 145, 178, 0.2)',
            'premium': '0 20px 50px -15px rgba(19, 78, 74, 0.15)',
            'glass': '0 8px 32px 0 rgba(8, 145, 178, 0.1)',
            'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
        },
        animation: {
          'float': 'float 10s ease-in-out infinite alternate',
          'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
          'spin-slow': 'spin 40s linear infinite',
        },
        keyframes: {
          float: {
            '0%': { transform: 'translateY(0) scale(1)' },
            '100%': { transform: 'translateY(-12px) scale(1.01)' },
          },
          'pulse-soft': {
            '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
            '50%': { opacity: '0.28', transform: 'scale(1.04)' },
          }
        }
      },
    },
    plugins: [],
}
