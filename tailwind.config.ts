import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — reference these in components, not raw palette values,
        // so future re-theming touches one place.
        brand: {
          DEFAULT: '#c0392b',
          fg: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};

export default config;
