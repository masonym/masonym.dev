/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-bright': 'var(--primary-bright)',
        'primary-dim': 'var(--primary-dim)',
        'primary-dark': 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        'secondary-bright': 'var(--secondary-bright)',
        background: 'var(--background)',
        'background-dim': 'var(--background-dim)',
        'background-bright': 'var(--background-bright)',
        footer: 'var(--footer-text)',
        'progress-red': 'var(--progress-red)',
        'progress-orange': 'var(--progress-orange)',
        'progress-yellow': 'var(--progress-yellow)',
        'progress-green': 'var(--progress-green)'
      },
      cursor: {
        'custom-click': 'url("../assets/cursorClick.png"), auto'
      },
      backgroundImage: {
        'cs-bg': "var(--cs-bg)",
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}

