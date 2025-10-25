/**
 * Telescope - Meta Package
 * 
 * This package re-exports all Telescope packages for convenience.
 * Install this package to get all Telescope functionality.
 */

// Re-export all packages
module.exports = {
  // Core
  ...require('@ruijadom/telescope-core'),
  
  // Browser Runtime
  ...require('@ruijadom/telescope-browser'),
  
  // Cursor Integration
  ...require('@ruijadom/telescope-cursor'),
  
  // Plugins
  vitePlugin: require('@ruijadom/telescope-vite'),
  webpackPlugin: require('@ruijadom/telescope-webpack'),
  
  // CLI (not re-exported, use via npx telescope)
};
