import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jaime153.github.io',
  base: '/Japon2026/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
