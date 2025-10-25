import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  globalName: 'Telescope',
  platform: 'browser',
  noExternal: ['@ruijadom/telescope-core'],
});
