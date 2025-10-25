# @ruijadom/telescope-core

Core types, configuration management, and WebSocket server for Telescope.

## Installation

```bash
npm install @ruijadom/telescope-core
```

## What's Included

- **Types**: TypeScript definitions for all Telescope components
- **Configuration**: Configuration management and validation
- **Server**: WebSocket server for browser-editor communication
- **Utilities**: Helper functions and error handling

## Usage

This package is typically used internally by other Telescope packages. You generally don't need to install it directly unless you're building custom integrations.

### Configuration

```typescript
import { TelescopeConfig, ConfigManager } from '@ruijadom/telescope-core';

const config: TelescopeConfig = {
  editor: {
    name: 'cursor',
    command: 'cursor',
    args: ['-g']
  },
  server: {
    port: 3737,
    host: 'localhost'
  }
};

const manager = new ConfigManager(config);
```

### Server

```typescript
import { TelescopeServer } from '@ruijadom/telescope-core';

const server = new TelescopeServer(config);
await server.start();
```

## Documentation

For full documentation, see the [main Telescope repository](https://github.com/ruijadom/telescope).

## License

MIT
