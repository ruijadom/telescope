# @ruijadom/telescope-vite

Vite plugin for Telescope integration.

## Installation

```bash
npm install --save-dev @ruijadom/telescope-vite
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { telescopePlugin } from '@ruijadom/telescope-vite';

export default defineConfig({
  plugins: [
    react(),
    telescopePlugin()
  ]
});
```

## Configuration

Pass options to customize Telescope:

```typescript
telescopePlugin({
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
3. Transforms components to add metadata
4. Preserves source maps for accurate navigation

## Requirements

- Vite 4.0+ or 5.0+
- React 16.8+

## Documentation

For full documentation, see the [main Telescope repository](https://github.com/ruijadom/telescope).

## License

MIT
