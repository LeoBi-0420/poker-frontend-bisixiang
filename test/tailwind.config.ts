import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        panel: '#FFFFFF',
        text: '#0F172A',
        muted: '#475569',
        accent: '#0F766E',
        border: '#E2E8F0',
        danger: '#B91C1C'
      },
      boxShadow: {
        card: '0 10px 25px -20px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
