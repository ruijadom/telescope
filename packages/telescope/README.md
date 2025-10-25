# Telescope

Developer tool for seamless navigation between React components in the browser and their source code in Cursor editor.

## Installation

```bash
npm install --save-dev @ruijadom/telescope
```

This meta package installs all Telescope packages:

- `@@ruijadom/telescope/core` - Core types and server
- `@@ruijadom/telescope/browser-runtime` - Browser component detection
- `@@ruijadom/telescope/cursor-integration` - Cursor editor integration
- `@@ruijadom/telescope/vite-plugin` - Vite plugin
- `@@ruijadom/telescope/webpack-plugin` - Webpack plugin
- `@@ruijadom/telescope/cli` - Command line interface

## Quick Start

### With Vite

```javascript
// vite.config.js
import { telescopePlugin } from '@ruijadom/telescope/vitePlugin';

export default {
  plugins: [telescopePlugin()]
};
```

### With Webpack

```javascript
// webpack.config.js
const { TelescopeWebpackPlugin } = require('@ruijadom/telescope/webpackPlugin');

module.exports = {
  plugins: [new TelescopeWebpackPlugin()]
};
```

### Start the Server

```bash
npx telescope start
```

## Documentation

For full documentation, visit the [main repository](https://github.com/yourusername/@ruijadom/telescope).

## License

MIT
