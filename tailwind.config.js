/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'] },
      colors: { ink: '#182230', mist: '#f5f7fb', brand: '#315efb' },
    },
  },
  plugins: [],
};
