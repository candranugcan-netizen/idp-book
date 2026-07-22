module.exports = {
  darkMode: 'class', // Mendukung Dark Mode berbasis class 'dark'
  content: ["./*.html", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      }
    },
  },
  plugins: [],
}