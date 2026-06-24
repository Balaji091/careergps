/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
        },
        customBg: '#FFFFFF',
        customCard: '#F8FAFC',
        customBorder: '#E5E7EB',
        customText: '#111827',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
    },
  },
  plugins: [],
}
