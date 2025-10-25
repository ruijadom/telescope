/**
 * Telescope - Meta Package Type Definitions
 */

// Re-export all types
export * from '@ruijadom/telescope-core';
export * from '@ruijadom/telescope-browser';
export * from '@ruijadom/telescope-cursor';

// Export plugins as named exports
export { telescopePlugin as vitePlugin } from '@ruijadom/telescope-vite';
export { TelescopeWebpackPlugin as webpackPlugin } from '@ruijadom/telescope-webpack';
