import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('./src/client', import.meta.url));
const outDir = fileURLToPath(new URL('./dist/client', import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 4000,
    proxy: {
      '/api/nearby-reports': 'http://127.0.0.1:3000',
      '/api/reports': 'http://127.0.0.1:3000',
      '/health': 'http://127.0.0.1:3000',
    },
  },
  preview: { host: '127.0.0.1', port: 4000 },
  build: { outDir, emptyOutDir: true },
});
