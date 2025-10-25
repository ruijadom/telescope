import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactHubblePlugin } from '@react-hubble/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    reactHubblePlugin({
      server: {
        port: 3737,
        host: 'localhost'
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: false
      }
    })
  ]
});
