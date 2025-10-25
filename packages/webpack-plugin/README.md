# @ruijadom/telescope-webpack

Webpack plugin for Telescope integration.

## Installation

```bash
npm install --save-dev @ruijadom/telescope-webpack
```

## Usage

Add the plugin to your `webpack.config.js`:

```javascript
const { TelescopeWebpackPlugin } = require('@ruijadom/telescope-webpack');

module.exports = {
  // ... other webpack config
  plugins: [
    new TelescopeWebpackPlugin()
  ]
};
```

## Configuration

Pass options to customize Telescope:

```javascript
new TelescopeWebpackPlugin({
  // Server configuration
  port: 3737,
  host: 'localhost',
  
  // Enable/disable in development
  enabled: true,
  
  // Editor configuration
  editor: {
    name: 'cursor',
    command: 'cursor',
    args: ['-g']
  }
})
```

## What It Does

1. Injects Telescope browser runtime into your app
2. Starts WebSocket server for browser-editor communication
3. Adds custom loader for component transformation
4. Preserves source maps for accurate navigation

## Requirements

- Webpack 5.0+
- React 16.8+

## Documentation

For full documentation, see the [main Telescope repository](https://github.com/ruijadom/telescope).

## License

MIT
