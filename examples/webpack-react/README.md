# Telescope - Webpack Example

This is a demonstration application showing Telescope integration with Webpack.

## Features

This example demonstrates:

- **Component Detection**: Click on any component while holding Ctrl to detect it
- **Source Navigation**: Open components directly in Cursor editor at the exact location
- **Test ID Analysis**: Identify components with and without test IDs
- **AI Test ID Generation**: Generate appropriate test IDs using AI
- **Webpack Integration**: Shows how to configure Telescope with Webpack

## Components

The example includes several components to showcase Telescope:

- **Navigation** (with test IDs): Demonstrates components that already have test IDs
- **SearchBar** (without test IDs): Interactive search component
- **ProductList** (without test IDs): List component managing state
- **ProductCard** (without test IDs): Reusable card component

## Setup

### Prerequisites

- Node.js 18+ installed
- Cursor editor installed
- Telescope CLI installed globally or in the workspace

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the Telescope server (in a separate terminal):

```bash
npx telescope start
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to http://localhost:3000

## Usage

### Activating Telescope

1. Press and hold `Ctrl` (or `Cmd` on Mac)
2. Click on any component in the browser
3. An overlay will appear showing component information

### Opening in Cursor

1. Activate Telescope and click a component
2. Click the "Open in Cursor" button in the overlay
3. Cursor will open the file at the exact component location

### Generating Test IDs

1. Activate Telescope and click a component without test IDs
2. Click "Generate Test IDs" in the overlay
3. Review the AI-generated suggestions
4. Approve to insert them into your source code

### Analyzing Test Coverage

1. Click the "Analyze Test IDs" button in the overlay
2. View a list of all components and their test ID status
3. Navigate to components missing test IDs
4. Generate test IDs as needed

## Configuration

The Webpack configuration is located in `webpack.config.js`:

```javascript
const { TelescopeWebpackPlugin } = require('@@ruijadom/telescope/webpack-plugin');

module.exports = {
  plugins: [
    new TelescopeWebpackPlugin({
      server: {
        port: 3737,
        host: 'localhost'
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: false
      }
    })
  ]
};
```

### Configuration Options

- `server.port`: WebSocket server port (default: 3737)
- `server.host`: Server host (default: 'localhost')
- `testId.convention`: Test ID attribute name (default: 'data-testid')
- `testId.autoGenerate`: Auto-generate test IDs (default: false)

### Development vs Production

The Telescope plugin is only active in development mode. In production builds, it's automatically excluded to keep your bundle size minimal.

## Project Structure

```
examples/webpack-react/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Navigation.tsx      # Component with test IDs
│   │   ├── SearchBar.tsx       # Component without test IDs
│   │   ├── ProductList.tsx     # Component without test IDs
│   │   └── ProductCard.tsx     # Component without test IDs
│   ├── App.tsx                 # Main application
│   ├── App.css                 # Styles
│   └── index.tsx               # Entry point
├── webpack.config.js           # Webpack configuration with Telescope
├── package.json
└── README.md
```

## Build Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Create production build
- `npm start`: Start development server and open browser

## Troubleshooting

### Telescope overlay doesn't appear

- Ensure the Telescope server is running (`npx telescope start`)
- Check browser console for connection errors
- Verify WebSocket connection to `ws://localhost:3737`
- Make sure you're running in development mode

### Cursor doesn't open

- Ensure Cursor is installed and in your PATH
- Check that file paths are correct
- Try opening files manually to verify Cursor installation

### Test IDs not generating

- Ensure AI service is configured in `telescope.config.js`
- Check that you have API access configured
- Review server logs for errors

### Webpack build errors

- Clear the `dist` folder and rebuild
- Ensure all dependencies are installed
- Check that TypeScript configuration is correct

## Differences from Vite Example

This Webpack example differs from the Vite example in:

- **Build Configuration**: Uses Webpack instead of Vite
- **Plugin Integration**: Uses `TelescopeWebpackPlugin` instead of `telescopePlugin`
- **Dev Server**: Webpack Dev Server instead of Vite's dev server
- **Component Examples**: Different set of components (e-commerce theme vs todo list)

Both examples demonstrate the same Telescope features but with different build tools.

## Learn More

- [Telescope Documentation](../../README.md)
- [Webpack Plugin API](../../packages/webpack-plugin/README.md)
- [Configuration Guide](../../docs/configuration.md)
- [Webpack Documentation](https://webpack.js.org/)

## License

MIT
