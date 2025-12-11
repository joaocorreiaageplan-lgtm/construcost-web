import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './', // CRÍTICO: Permite que o site funcione em subdiretórios (GitHub Pages)
    plugins: [react()],
    define: {
      // Isso permite que o código use process.env.API_KEY sem quebrar no navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
    }
  };
});