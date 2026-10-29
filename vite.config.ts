import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite sert déjà index.html pour toutes les routes SPA (dev et preview).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
