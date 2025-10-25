# Telescope - Vite Example

This is a demonstration application showing Telescope integration with Vite.

## Features

This example demonstrates:

- **Component Detection**: Click on any component while holding Ctrl to detect it
- **Source Navigation**: Open components directly in Cursor editor at the exact location
- **Test ID Analysis**: Identify components with and without test IDs
- **AI Test ID Generation**: Generate appropriate test IDs using AI

## Components

The example includes several components to showcase Telescope:

- **Header** (with test IDs): Demonstrates components that already have test IDs
- **UserProfile** (without test IDs): Shows how Telescope detects missing test IDs
- **TodoList** (without test IDs): Interactive component for testing
- **TodoItem** (without test IDs): Child component example

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

4. Open your browser to the URL shown (typically http://localhost:5173)

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

The Vite configuration is located in `vite.config.ts`:

```typescript
import { telescopePlugin } from '@@ruijadom/telescope/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    telescopePlugin({
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
});
```

### Configuration Options

- `server.port`: WebSocket server port (default: 3737)
- `server.host`: Server host (default: 'localhost')
- `testId.convention`: Test ID attribute name (default: 'data-testid')
- `testId.autoGenerate`: Auto-generate test IDs (default: false)

## Project Structure

```
examples/vite-react/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Component with test IDs
│   │   ├── UserProfile.tsx     # Component without test IDs
│   │   ├── TodoList.tsx        # Component without test IDs
│   │   └── TodoItem.tsx        # Component without test IDs
│   ├── App.tsx                 # Main application
│   ├── App.css                 # Styles
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration with Telescope
├── package.json
└── README.md
```

## Troubleshooting

### Telescope overlay doesn't appear

- Ensure the Telescope server is running (`npx telescope start`)
- Check browser console for connection errors
- Verify WebSocket connection to `ws://localhost:3737`

### Cursor doesn't open

- Ensure Cursor is installed and in your PATH
- Check that file paths are correct
- Try opening files manually to verify Cursor installation

### Test IDs not generating

- Ensure AI service is configured in `telescope.config.js`
- Check that you have API access configured
- Review server logs for errors

## Learn More

- [Telescope Documentation](../../README.md)
- [Vite Plugin API](../../packages/vite-plugin/README.md)
- [Configuration Guide](../../docs/configuration.md)

## License

MIT
