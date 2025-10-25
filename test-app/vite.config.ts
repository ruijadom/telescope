import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { telescopePlugin } from '@ruijadom/telescope-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    telescopePlugin({
      editor: {
        name: 'cursor',
        command: 'cursor',
        args: ['-g'],
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: true,
      },
      ai: {
        enabled: false,
        provider: 'cursor-native',
      },
      project: {
        roots: ['src'],
        extensions: ['.tsx', '.jsx', '.ts', '.js'],
        exclude: ['node_modules', 'dist', 'build'],
      },
      server: {
        port: 3740,
        host: 'localhost',
      },
    }),
  ],
})
