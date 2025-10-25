# @ruijadom/telescope-browser

Browser runtime for component detection and overlay UI.

## Installation

```bash
npm install @ruijadom/telescope-browser
```

## What's Included

- **Component Detector**: Detects React components using Fiber internals
- **Overlay UI**: Interactive overlay for component inspection
- **WebSocket Client**: Communicates with Telescope server
- **Tree View**: Visual component hierarchy
- **Analysis Panel**: Test ID coverage analysis

## Usage

This package is automatically injected by the Vite or Webpack plugin. You don't need to import it manually.

### Manual Initialization

If you need to initialize manually:

```typescript
import { initialize } from '@ruijadom/telescope-browser';

initialize();
```

### Browser Global

The browser runtime is available globally as `window.Telescope`:

```javascript
// Check if Telescope is active
console.log(window.Telescope);
```

## Features

- Click-to-inspect component detection
- Real-time component tree visualization
- Test ID coverage analysis
- Keyboard shortcuts (Ctrl/Cmd + Shift)

## Documentation

For full documentation, see the [main Telescope repository](https://github.com/ruijadom/telescope).

## License

MIT
