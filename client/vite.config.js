import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, Vite runs on :5173 and forwards /api calls to the Express API on :3000.
// In production, Express serves the built files from client/dist, so everything is one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3000' }
  }
});
