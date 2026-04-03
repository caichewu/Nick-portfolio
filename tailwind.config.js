/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#39FF14',      // 荧光绿点缀
        'light-bg': '#0D0D0D',     // 统一深色背景
        'light-card': '#121212',   // 卡片底色
        'light-text': '#EAEAEA',   // 柔和白
        'light-subtext': '#9CA3AF',// 次要文字
        'dark-bg': '#0D0D0D',
        'dark-card': '#121212',
        'dark-text': '#EAEAEA',
        'dark-subtext': '#9CA3AF',
        'ui-border': '#222222',
        'metal-light': '#4A4A4A',
        'metal-dark': '#2A2A2A',
      },
      fontFamily: {
        sans: ['"Inter"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 12px rgba(57,255,20,0.35), 0 0 24px rgba(57,255,20,0.25)',
      },
      dropShadow: {
        'glow-green': '0 0 10px rgba(57, 255, 20, 0.7)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(57, 255, 20, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(57, 255, 20, 0.7)' },
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
