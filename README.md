# 🔭 Telescope

Developer tool for seamless navigation between UI components in the browser and their source code in your editor. Telescope bridges the gap between what you see in the browser and where it lives in your code, making component discovery and test ID management effortless.

> **Framework Agnostic**: While optimized for React, Telescope's architecture supports any component-based framework.

## Features

- 🔍 **Component Detection**: Click any React component in your browser to identify it instantly
- 🚀 **Editor Navigation**: Jump directly to component source code in Cursor at the exact line
- 🤖 **AI-Powered Test IDs**: Generate contextual test identifiers automatically using AI
- 🌳 **Component Tree Visualization**: Understand your app's component hierarchy at a glance
- 📊 **Test ID Analysis**: Identify components missing test IDs across your application
- 🔧 **Build Tool Integration**: Works seamlessly with Vite and Webpack
- ⚡ **Zero Config**: Works out of the box with sensible defaults

## Quick Start

### Installation

Install Telescope in your project:

```bash
npm install --save-dev @ruijadom/telescope
```

### Setup with Vite

Add the Telescope plugin to your `vite.config.ts`:

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

### Setup with Webpack

Add the Telescope plugin to your `webpack.config.js`:

```javascript
const { TelescopeWebpackPlugin } = require('@ruijadom/telescope-webpack');

module.exports = {
  // ... other webpack config
  plugins: [
    new TelescopeWebpackPlugin()
  ]
};
```

### Start Using Telescope

1. Start your development server:

```bash
npm run dev
```

2. Open your app in the browser

3. Hold `Ctrl+Shift` (or `Cmd+Shift` on Mac) to activate

4. Click any component to see details and actions

That's it! Telescope is now active in your development environment.

## Usage

### Component Navigation

1. **Activate Telescope**: Hold `Ctrl+Shift` (or `Cmd+Shift` on Mac) and hover over components
2. **Click a component**: An overlay displays component details
3. **Open in Editor**: Click "Open in Cursor" to jump to the source code
4. **View component tree**: Explore the component hierarchy in the tree view

### Test ID Generation

1. **Select a component**: Click on a component without test IDs
2. **Generate test IDs**: Click "Generate Test IDs" in the overlay
3. **Review suggestions**: AI analyzes your component and suggests appropriate test IDs
4. **Approve and insert**: Click to insert test IDs directly into your source code

### Test ID Analysis

1. **Open analysis panel**: Click "Analyze Test IDs" in the overlay
2. **View coverage**: See which components have test IDs and which don't
3. **Navigate to components**: Click on any component to jump to its location
4. **Generate missing IDs**: Quickly add test IDs to components that need them

## Configuration

Telescope works with zero configuration, but you can customize it by creating a `telescope.config.js` file in your project root:

```javascript
module.exports = {
  // Editor configuration
  editor: {
    name: 'cursor',
    command: 'cursor',
    args: ['-g']
  },
  
  // Test ID configuration
  testId: {
    convention: 'data-testid',  // or 'data-test-id', 'data-qa', etc.
    autoGenerate: false
  },
  
  // AI configuration
  ai: {
    enabled: true,
    provider: 'cursor-native'  // Uses Cursor's built-in AI
  },
  
  // Project structure
  project: {
    roots: ['src'],
    extensions: ['.tsx', '.jsx', '.ts', '.js'],
    exclude: ['node_modules', 'dist', 'build']
  },
  
  // Server configuration
  server: {
    port: 3737,
    host: 'localhost'
  }
};
```

### Configuration Options

#### Editor Settings

- `editor.name`: Editor to use (`'cursor'`, `'vscode'`, `'webstorm'`)
- `editor.command`: Command to launch the editor
- `editor.args`: Arguments passed to the editor command

#### Test ID Settings

- `testId.convention`: Test ID attribute name (default: `'data-testid'`)
- `testId.customPattern`: Custom test ID pattern (optional)
- `testId.autoGenerate`: Automatically generate test IDs on component creation

#### AI Settings

- `ai.enabled`: Enable AI-powered test ID generation
- `ai.provider`: AI provider (`'cursor-native'`, `'openai'`, `'anthropic'`)
- `ai.model`: Specific model to use (optional)
- `ai.apiKey`: API key for external providers (optional)

#### Project Settings

- `project.roots`: Source directories to scan
- `project.extensions`: File extensions to process
- `project.exclude`: Directories to ignore

#### Server Settings

- `server.port`: WebSocket server port (default: `3737`)
- `server.host`: Server host (default: `'localhost'`)

## CLI Commands

Telescope includes a CLI for managing the development server:

```bash
# Initialize configuration file
npx telescope init

# Start the Telescope server
npx telescope start

# Stop the Telescope server
npx telescope stop

# Check server status
npx telescope status
```

The Telescope server typically starts automatically when you run your dev server with the plugin configured, but you can also manage it manually with these commands.

## Packages

This is a monorepo containing the following packages:

- `@ruijadom/telescope-core` - Core types, configuration, and WebSocket server
- `@ruijadom/telescope-browser` - Browser component detection and UI
- `@ruijadom/telescope-cursor` - Cursor editor integration
- `@ruijadom/telescope-vite` - Vite build tool plugin
- `@ruijadom/telescope-webpack` - Webpack build tool plugin
- `@ruijadom/telescope-cli` - Command line interface
- `@ruijadom/telescope` - Meta package that installs all dependencies

## How It Works

Telescope uses a multi-layered architecture:

1. **Browser Runtime**: Injected into your app during development, it detects components using framework internals (React Fiber for React apps)
2. **WebSocket Server**: Local server that facilitates communication between browser and editor
3. **Editor Integration**: Opens files in your editor at precise locations and inserts generated code
4. **Build Plugins**: Inject the browser runtime and preserve source maps for accurate navigation

The system only runs in development mode and has zero impact on production builds.

## Examples

Check out the example applications to see Telescope in action:

- [Vite + React Example](./examples/vite-react) - Todo list app with Vite
- [Webpack + React Example](./examples/webpack-react) - E-commerce app with Webpack

## Troubleshooting

### Overlay doesn't appear when clicking components

**Possible causes:**
- Telescope server not running
- WebSocket connection failed
- Not holding Ctrl+Shift while clicking
- React DevTools not detecting React

**Solutions:**
- Check that your dev server is running
- Hold `Ctrl+Shift` (or `Cmd+Shift`) before clicking
- Open browser console and look for `[Telescope]` messages
- Verify WebSocket connects to `ws://localhost:3737`
- Ensure React is properly installed and running

### Cursor doesn't open when clicking "Open in Cursor"

**Possible causes:**
- Cursor not installed
- Cursor not in system PATH
- File path resolution issues

**Solutions:**
- Install Cursor from [cursor.sh](https://cursor.sh)
- Add Cursor to your PATH: `cursor --install-command`
- Check browser console for file path errors
- Try opening files manually to verify Cursor installation

### Test IDs not generating

**Possible causes:**
- AI service not configured
- API rate limits exceeded
- Network connectivity issues

**Solutions:**
- Verify AI configuration in `telescope.config.js`
- Check that you have API access (for external providers)
- Review server logs for detailed error messages
- Try manual test ID entry as a fallback

### Source maps not resolving correctly

**Possible causes:**
- Source maps disabled in build config
- Incorrect source map paths
- Build tool misconfiguration

**Solutions:**
- Enable source maps in your Vite/Webpack config
- Ensure `devtool: 'source-map'` in Webpack config
- Check that source maps are generated in dev mode
- Verify file paths in generated source maps

### WebSocket connection errors

**Possible causes:**
- Port 3737 already in use
- Firewall blocking connections
- Server not started

**Solutions:**
- Change port in `telescope.config.js` if 3737 is taken
- Check firewall settings for localhost connections
- Manually start server with `npx telescope start`
- Verify server status with `npx telescope status`

### Plugin not working in production

**Expected behavior:**
Telescope is designed to only run in development mode. It automatically disables itself in production builds to keep your bundle size minimal and avoid exposing development tools.

### Component detection fails for certain components

**Possible causes:**
- Components not using React Fiber
- Third-party components without proper metadata
- Heavily optimized production builds

**Solutions:**
- Ensure you're running in development mode
- Check that React DevTools can detect the component
- Try clicking on child elements within the component
- Verify the component is actually a React component

## Requirements

- Node.js >= 18.0.0
- React >= 16.8.0 (Hooks support)
- TypeScript >= 5.0.0 (for TypeScript projects)
- Cursor editor (or compatible editor)

## Browser Support

Telescope works in all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

Contributions are welcome! This is a monorepo managed with npm workspaces.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/@ruijadom/telescope.git
cd @ruijadom/telescope

# Install dependencies
npm install

# Build all packages
npm run build

# Run in watch mode for development
npm run dev

# Run tests
npm test

# Clean build artifacts
npm run clean
```

### Project Structure

```
@ruijadom/telescope/
├── packages/
│   ├── core/                 # Core functionality
│   ├── browser-runtime/      # Browser injection
│   ├── cursor-integration/   # Editor integration
│   ├── vite-plugin/          # Vite plugin
│   ├── webpack-plugin/       # Webpack plugin
│   └── cli/                  # CLI tool
├── examples/                 # Example applications
│   ├── vite-react/          # Vite example
│   └── webpack-react/       # Webpack example
├── docs/                     # Documentation
└── package.json              # Root package
```

### Running Examples

```bash
# Run Vite example
cd examples/vite-react
npm install
npm run dev

# Run Webpack example
cd examples/webpack-react
npm install
npm run dev
```

## License

MIT

## Support

- 📖 [Documentation](./docs)
- 🐛 [Issue Tracker](https://github.com/yourusername/@ruijadom/telescope/issues)
- 💬 [Discussions](https://github.com/yourusername/@ruijadom/telescope/discussions)

## Acknowledgments

Telescope is inspired by the need for better developer tools that bridge the gap between browser and editor. Special thanks to the React team for React DevTools and the Cursor team for building an amazing AI-powered editor.
