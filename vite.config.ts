import { defineConfig } from 'vite';
import tsx from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [tsx()],
  server: {
    port: 3000,
  },
  css: {
    postcss: './postcss.config.mjs',
  },
});
