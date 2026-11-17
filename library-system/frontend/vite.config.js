import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. In development the frontend runs on :5173 and calls the API on
// :3000 directly (the backend enables CORS). For production, set VITE_API_URL.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
