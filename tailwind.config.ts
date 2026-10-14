import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        sidebar: '#0C0D10',
        surface: '#121318',
        elevated: '#181A20',
      },
    },
  },
  plugins: [],
};

export default config;
