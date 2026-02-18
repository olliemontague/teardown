
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Teardown application.
// Removed loadEnv and manual API_KEY definition to resolve the process.cwd() error 
// and comply with the requirement that process.env.API_KEY is provided by the environment.
export default defineConfig(() => {
  return {
    plugins: [react()],
    base: './', // Ensures assets load correctly on GitHub Pages
    build: {
      outDir: 'dist',
    }
  };
});
