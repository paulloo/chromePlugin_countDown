/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  mode: "jit",
  content: ["./**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        amber: colors.amber,
        lime: colors.lime,
        rose: colors.rose,
        orange: colors.orange,
      }
    },
    backgroundColor: {
      //utilities like `bg-base` and `bg-primary`
      base: 'var(--color-base)',
      'off-base': 'var(--color-off-base)',
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      muted: 'var(--color-text-muted)',
    },
    textColor: {
      //like `text-base` and `text-primary`
      base: 'var(--color-text-base)',
      muted: 'var(--color-text-muted)',
      'muted-hover': 'var(--color-text-muted-hover)',
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
    }
  },
  plugins: [],
}

