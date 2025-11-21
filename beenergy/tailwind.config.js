/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BeEnergy brand colors
        'verde-profesional': '#059669',
        'azul-marino': '#0300AB',
        'azul-secundario': '#1B3659',
        'cyan-turquesa': '#8DE8F2',
        'amarillo-dorado': '#FCC544',
        'gris-claro': '#F2F2F2',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'nunito-mono': ['Nunito', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
