# Telescope API Documentation

This document provides comprehensive API documentation for all public interfaces and classes in Telescope.

## Table of Contents

- [Core Types](#core-types)
- [Browser Runtime API](#browser-runtime-api)
- [Cursor Integration API](#cursor-integration-api)
- [Plugin APIs](#plugin-apis)
- [WebSocket Protocol](#websocket-protocol)
- [Configuration API](#configuration-api)

## Core Types

All core types are exported from `@@ruijadom/telescope/core`:

```typescript
import type { 
  ComponentData, 
  EditorCommand, 
  TestIdSuggestion, 
  TelescopeConfig,
  WebSocketMessage 
} from '@@ruijadom/telescope/core';
```

### ComponentData

Represents detected React component information.

```typescript
interface ComponentData {
  /** Component display name */
  name: string;
  
  /** Absolute file path to component source */
  filePath: string;
  
  /** Line number where component is defined */
  lineNumber: number;
  
  /** Column number where component is defined */
  columnNumber: number;
  
  /** Component props and their values */
  props: Record<string, any>;
  
  /** Existing test IDs found on the component */
  testIds: string[];
  
  /** Component type (functional or class) */
  type: 'functional' | 'class';
  
  /** Unique identifier for this component instance */
  instanceId: string;
}
```

**Example:**

```typescript
const componentData: ComponentData = {
  name: 'UserProfile',
  filePath: '/Users/dev/project/src/components/UserProfile.tsx',
  lineNumber: 15,
  columnNumber: 7,
  props: { userId: '123', name: 'John Doe' },
  testIds: [],
  type: 'functional',
  instanceId: 'fiber-node-42'
};
```

### EditorCommand

Represents a command to be executed in the editor.

```typescript
interface EditorCommand {
  /** Command type */
  type: 'open' | 'insert' | 'analyze';
  
  /** Target file path */
  filePath: string;
  
  /** Line number for cursor positioning */
  line?: number;
  
  /** Column number for cursor positioning */
  column?: number;
  
  /** Code to insert (for insert commands) */
  code?: string;
  
  /** Component data for context */
  componentData?: ComponentData;
}
```

**Example:**

```typescript
const openCommand: EditorCommand = {
  type: 'open',
  filePath: '/Users/dev/project/src/App.tsx',
  line: 42,
  column: 10
};

const insertCommand: EditorCommand = {
  type: 'insert',
  filePath: '/Users/dev/project/src/Button.tsx',
  line: 15,
  code: 'data-testid="submit-button"'
};
```

### TestIdSuggestion

Represents an AI-generated test ID suggestion.

```typescript
interface TestIdSuggestion {
  /** Type of element (button, input, etc.) */
  elementType: string;
  
  /** Suggested test ID value */
  suggestedId: string;
  
  /** Explanation for this suggestion */
  reason: string;
  
  /** Line number where test ID should be inserted */
  insertionLine: number;
  
  /** Full attribute string to insert */
  attributeString: string;
}
```

**Example:**

```typescript
const suggestion: TestIdSuggestion = {
  elementType: 'button',
  suggestedId: 'submit-form-button',
  reason: 'Primary action button for form submission',
  insertionLine: 23,
  attributeString: 'data-testid="submit-form-button"'
};
```

### TelescopeConfig

Complete configuration object for Telescope.

```typescript
interface TelescopeConfig {
  /** Editor configuration */
  editor: {
    name: 'cursor' | 'vscode' | 'webstorm';
    command: string;
    args: string[];
  };
  
  /** Test ID pattern configuration */
  testId: {
    convention: 'data-testid' | 'data-test-id' | 'data-qa' | 'custom';
    customPattern?: string;
    autoGenerate: boolean;
  };
  
  /** AI configuration */
  ai: {
    enabled: boolean;
    provider: 'cursor-native' | 'openai' | 'anthropic';
    model?: string;
    apiKey?: string;
  };
  
  /** Project structure */
  project: {
    roots: string[];
    extensions: string[];
    exclude: string[];
  };
  
  /** Server configuration */
  server: {
    port: number;
    host: string;
  };
}
```

### WebSocketMessage

Message format for browser-server communication.

```typescript
interface WebSocketMessage {
  /** Message type */
  type: 'component-selected' | 'open-editor' | 'generate-testids' | 'insert-code' | 'error';
  
  /** Message payload */
  payload: any;
  
  /** Request ID for tracking */
  requestId: string;
  
  /** Timestamp */
  timestamp: number;
}
```

## Browser Runtime API

The browser runtime is automatically injected by the build plugins. You typically don't need to interact with it directly, but these APIs are available for advanced use cases.

### ComponentDetector

Detects React components from DOM elements.

```typescript
import { ComponentDetector } from '@@ruijadom/telescope/browser-runtime';

const detector = new ComponentDetector();
```

#### Methods

##### `detectComponent(element: HTMLElement): ComponentData | null`

Detects a React component from a DOM element.

**Parameters:**
- `element`: The DOM element to analyze

**Returns:**
- `ComponentData` object if a component is found
- `null` if no component is detected

**Example:**

```typescript
const element = document.querySelector('.my-component');
const componentData = detector.detectComponent(element);

if (componentData) {
  console.log(`Found component: ${componentData.name}`);
  console.log(`Location: ${componentData.filePath}:${componentData.lineNumber}`);
}
```

##### `buildComponentTree(rootElement: HTMLElement): ComponentTreeNode[]`

Builds a hierarchical tree of React components.

**Parameters:**
- `rootElement`: The root DOM element to start from

**Returns:**
- Array of `ComponentTreeNode` objects representing the component hierarchy

**Example:**

```typescript
const tree = detector.buildComponentTree(document.body);
console.log('Component tree:', tree);
```

##### `scanForMissingTestIds(rootElement: HTMLElement): MissingTestIdReport`

Scans for components missing test IDs.

**Parameters:**
- `rootElement`: The root DOM element to scan

**Returns:**
- `MissingTestIdReport` object with statistics and component list

**Example:**

```typescript
const report = detector.scanForMissingTestIds(document.body);
console.log(`Components without test IDs: ${report.missingCount}`);
console.log(`Total interactive elements: ${report.totalCount}`);
```

### TelescopeClient

WebSocket client for communicating with the Telescope server.

```typescript
import { TelescopeClient } from '@@ruijadom/telescope/browser-runtime';

const client = new TelescopeClient();
```

#### Methods

##### `connect(url: string): Promise<void>`

Connects to the Hubble WebSocket server.

**Parameters:**
- `url`: WebSocket server URL (e.g., `'ws://localhost:3737'`)

**Returns:**
- Promise that resolves when connected

**Example:**

```typescript
await client.connect('ws://localhost:3737');
console.log('Connected to Telescope server');
```

##### `send(message: WebSocketMessage): Promise<any>`

Sends a message to the server and waits for a response.

**Parameters:**
- `message`: The message to send

**Returns:**
- Promise that resolves with the server response

**Example:**

```typescript
const response = await client.send({
  type: 'open-editor',
  payload: componentData,
  requestId: crypto.randomUUID(),
  timestamp: Date.now()
});
```

##### `disconnect(): void`

Disconnects from the server.

**Example:**

```typescript
client.disconnect();
```

### ComponentOverlay

UI overlay for displaying component information.

```typescript
import { ComponentOverlay } from '@@ruijadom/telescope/browser-runtime';

const overlay = new ComponentOverlay();
```

#### Methods

##### `show(componentData: ComponentData, position: { x: number; y: number }): void`

Shows the overlay with component information.

**Parameters:**
- `componentData`: The component data to display
- `position`: Screen coordinates for overlay placement

**Example:**

```typescript
overlay.show(componentData, { x: 100, y: 200 });
```

##### `hide(): void`

Hides the overlay.

**Example:**

```typescript
overlay.hide();
```

## Cursor Integration API

APIs for integrating with Cursor editor.

### CursorOpener

Opens files in Cursor at specific locations.

```typescript
import { CursorOpener } from '@@ruijadom/telescope/cursor-integration';

const opener = new CursorOpener(config);
```

#### Methods

##### `openFile(filePath: string, line: number, column: number): Promise<void>`

Opens a file in Cursor at the specified location.

**Parameters:**
- `filePath`: Absolute path to the file
- `line`: Line number (1-indexed)
- `column`: Column number (1-indexed)

**Returns:**
- Promise that resolves when the file is opened

**Example:**

```typescript
await opener.openFile(
  '/Users/dev/project/src/App.tsx',
  42,
  10
);
```

**Error Handling:**

```typescript
try {
  await opener.openFile(filePath, line, column);
} catch (error) {
  if (error.code === 'CURSOR_NOT_FOUND') {
    console.error('Cursor is not installed');
  } else if (error.code === 'FILE_NOT_FOUND') {
    console.error('File does not exist');
  }
}
```

### AIService

AI-powered test ID generation service.

```typescript
import { AIService } from '@@ruijadom/telescope/cursor-integration';

const aiService = new AIService(config);
```

#### Methods

##### `generateTestIds(componentData: ComponentData): Promise<TestIdSuggestion[]>`

Generates test ID suggestions for a component using AI.

**Parameters:**
- `componentData`: The component to analyze

**Returns:**
- Promise that resolves with an array of test ID suggestions

**Example:**

```typescript
const suggestions = await aiService.generateTestIds(componentData);

suggestions.forEach(suggestion => {
  console.log(`${suggestion.elementType}: ${suggestion.suggestedId}`);
  console.log(`Reason: ${suggestion.reason}`);
});
```

##### `detectConvention(projectRoot: string): Promise<string>`

Detects the test ID convention used in the project.

**Parameters:**
- `projectRoot`: Path to the project root directory

**Returns:**
- Promise that resolves with the detected convention (e.g., `'data-testid'`)

**Example:**

```typescript
const convention = await aiService.detectConvention('/Users/dev/project');
console.log(`Detected convention: ${convention}`);
```

### CodeInserter

Inserts code into source files.

```typescript
import { CodeInserter } from '@@ruijadom/telescope/cursor-integration';

const inserter = new CodeInserter();
```

#### Methods

##### `insertTestId(filePath: string, lineNumber: number, testIdAttribute: string): Promise<void>`

Inserts a test ID attribute into a source file.

**Parameters:**
- `filePath`: Path to the file
- `lineNumber`: Line number where to insert
- `testIdAttribute`: The attribute string to insert

**Returns:**
- Promise that resolves when the insertion is complete

**Example:**

```typescript
await inserter.insertTestId(
  '/Users/dev/project/src/Button.tsx',
  15,
  'data-testid="submit-button"'
);
```

**Error Handling:**

```typescript
try {
  await inserter.insertTestId(filePath, line, attribute);
} catch (error) {
  if (error.code === 'FILE_READ_ERROR') {
    console.error('Could not read file');
  } else if (error.code === 'PARSE_ERROR') {
    console.error('Could not parse JSX');
  } else if (error.code === 'FILE_WRITE_ERROR') {
    console.error('Could not write file');
  }
}
```

## Plugin APIs

### Vite Plugin

```typescript
import { telescopePlugin } from '@@ruijadom/telescope/vite-plugin';
```

#### `telescopePlugin(options?: Partial<TelescopeConfig>): Plugin`

Creates a Vite plugin for Telescope integration.

**Parameters:**
- `options`: Optional configuration overrides

**Returns:**
- Vite plugin object

**Example:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
      },
      ai: {
        enabled: true,
        provider: 'cursor-native'
      }
    })
  ]
});
```

**Plugin Hooks:**

The plugin implements the following Vite hooks:

- `transformIndexHtml`: Injects the browser runtime script
- `configureServer`: Starts the Hubble WebSocket server
- `transform`: Adds metadata to React components (optional)

### Webpack Plugin

```typescript
import { TelescopeWebpackPlugin } from '@@ruijadom/telescope/webpack-plugin';
```

#### `new TelescopeWebpackPlugin(options?: Partial<TelescopeConfig>)`

Creates a Webpack plugin for Telescope integration.

**Parameters:**
- `options`: Optional configuration overrides

**Returns:**
- Webpack plugin instance

**Example:**

```javascript
const { TelescopeWebpackPlugin } = require('@@ruijadom/telescope/webpack-plugin');

module.exports = {
  // ... other webpack config
  plugins: [
    new TelescopeWebpackPlugin({
      server: {
        port: 3737,
        host: 'localhost'
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: false
      },
      ai: {
        enabled: true,
        provider: 'cursor-native'
      }
    })
  ]
};
```

**Plugin Behavior:**

- Only active in development mode (`mode: 'development'`)
- Injects browser runtime via HtmlWebpackPlugin
- Registers custom loader for React component transformation
- Starts Hubble WebSocket server during compilation

## WebSocket Protocol

Telescope uses WebSocket for real-time communication between the browser and the local server.

### Connection

**URL:** `ws://localhost:3737` (default)

**Connection Flow:**

```
Browser                          Server
   |                               |
   |--- WebSocket Connect -------->|
   |<-- Connection Accepted -------|
   |                               |
   |--- Message (request) -------->|
   |<-- Message (response) --------|
```

### Message Format

All messages follow this structure:

```typescript
{
  type: string;           // Message type
  payload: any;           // Message-specific data
  requestId: string;      // Unique request identifier
  timestamp: number;      // Unix timestamp in milliseconds
}
```

### Message Types

#### `component-selected`

Sent when a user selects a component in the browser.

**Direction:** Browser → Server

**Payload:**

```typescript
{
  type: 'component-selected',
  payload: ComponentData,
  requestId: '550e8400-e29b-41d4-a716-446655440000',
  timestamp: 1698765432000
}
```

**Response:**

```typescript
{
  type: 'component-selected-ack',
  payload: { success: true },
  requestId: '550e8400-e29b-41d4-a716-446655440000',
  timestamp: 1698765432100
}
```

#### `open-editor`

Requests to open a file in the editor.

**Direction:** Browser → Server

**Payload:**

```typescript
{
  type: 'open-editor',
  payload: {
    filePath: '/Users/dev/project/src/App.tsx',
    line: 42,
    column: 10
  },
  requestId: '550e8400-e29b-41d4-a716-446655440001',
  timestamp: 1698765433000
}
```

**Response:**

```typescript
{
  type: 'open-editor-result',
  payload: { 
    success: true,
    editorOpened: true
  },
  requestId: '550e8400-e29b-41d4-a716-446655440001',
  timestamp: 1698765433500
}
```

#### `generate-testids`

Requests AI-generated test ID suggestions.

**Direction:** Browser → Server

**Payload:**

```typescript
{
  type: 'generate-testids',
  payload: ComponentData,
  requestId: '550e8400-e29b-41d4-a716-446655440002',
  timestamp: 1698765434000
}
```

**Response:**

```typescript
{
  type: 'testids-generated',
  payload: {
    suggestions: TestIdSuggestion[]
  },
  requestId: '550e8400-e29b-41d4-a716-446655440002',
  timestamp: 1698765437000
}
```

#### `insert-code`

Requests code insertion into a source file.

**Direction:** Browser → Server

**Payload:**

```typescript
{
  type: 'insert-code',
  payload: {
    filePath: '/Users/dev/project/src/Button.tsx',
    lineNumber: 15,
    code: 'data-testid="submit-button"'
  },
  requestId: '550e8400-e29b-41d4-a716-446655440003',
  timestamp: 1698765438000
}
```

**Response:**

```typescript
{
  type: 'code-inserted',
  payload: { 
    success: true,
    linesModified: 1
  },
  requestId: '550e8400-e29b-41d4-a716-446655440003',
  timestamp: 1698765438200
}
```

#### `error`

Error response for any failed operation.

**Direction:** Server → Browser

**Payload:**

```typescript
{
  type: 'error',
  payload: {
    code: 'FILE_NOT_FOUND',
    message: 'The specified file does not exist',
    details: {
      filePath: '/Users/dev/project/src/Missing.tsx'
    }
  },
  requestId: '550e8400-e29b-41d4-a716-446655440004',
  timestamp: 1698765439000
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `COMPONENT_DETECTION_ERROR` | Failed to detect React component |
| `FILE_NOT_FOUND` | Specified file does not exist |
| `CURSOR_NOT_FOUND` | Cursor editor not installed |
| `WEBSOCKET_ERROR` | WebSocket connection error |
| `AI_ERROR` | AI service error |
| `PARSE_ERROR` | Failed to parse source code |
| `FILE_READ_ERROR` | Failed to read file |
| `FILE_WRITE_ERROR` | Failed to write file |
| `INVALID_MESSAGE` | Invalid message format |
| `TIMEOUT` | Operation timed out |

### Reconnection Strategy

The browser client implements automatic reconnection with exponential backoff:

```
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 seconds delay
Attempt 4: 4 seconds delay
Max attempts: 5
```

## Configuration API

### ConfigManager

Manages Telescope configuration.

```typescript
import { ConfigManager } from '@@ruijadom/telescope/core';

const configManager = new ConfigManager();
```

#### Methods

##### `load(projectRoot: string): Promise<TelescopeConfig>`

Loads configuration from the project.

**Parameters:**
- `projectRoot`: Path to the project root directory

**Returns:**
- Promise that resolves with the complete configuration

**Example:**

```typescript
const config = await configManager.load('/Users/dev/project');
console.log('Server port:', config.server.port);
```

##### `static getDefaults(): TelescopeConfig`

Returns the default configuration.

**Returns:**
- Default `TelescopeConfig` object

**Example:**

```typescript
const defaults = ConfigManager.getDefaults();
console.log('Default port:', defaults.server.port); // 3737
```

### Configuration File

Create a `telescope.config.js` file in your project root:

```javascript
module.exports = {
  editor: {
    name: 'cursor',
    command: 'cursor',
    args: ['-g']
  },
  testId: {
    convention: 'data-testid',
    autoGenerate: false
  },
  ai: {
    enabled: true,
    provider: 'cursor-native'
  },
  project: {
    roots: ['src'],
    extensions: ['.tsx', '.jsx', '.ts', '.js'],
    exclude: ['node_modules', 'dist', 'build']
  },
  server: {
    port: 3737,
    host: 'localhost'
  }
};
```

## Plugin Development Guide

You can extend Telescope by creating custom plugins.

### Creating a Custom Plugin

```typescript
import type { HubblePlugin } from '@@ruijadom/telescope/core';

export const myCustomPlugin: HubblePlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  
  // Called when a component is detected
  onComponentDetected(data) {
    console.log('Component detected:', data.name);
    // Add custom logic here
  },
  
  // Called when editor is opened
  onEditorOpened(filePath) {
    console.log('Editor opened:', filePath);
    // Add custom logic here
  },
  
  // Called when test IDs are generated
  onTestIdGenerated(suggestions) {
    console.log('Test IDs generated:', suggestions.length);
    // Add custom logic here
  },
  
  // Custom commands
  commands: {
    'my-custom-command': async (payload) => {
      // Handle custom command
      return { success: true };
    }
  }
};
```

### Registering a Plugin

```javascript
// telescope.config.js
const { myCustomPlugin } = require('./my-custom-plugin');

module.exports = {
  // ... other config
  plugins: [myCustomPlugin]
};
```

### Plugin Lifecycle

1. **Initialization**: Plugin is loaded when Hubble starts
2. **Component Detection**: `onComponentDetected` is called for each detected component
3. **Editor Navigation**: `onEditorOpened` is called when files are opened
4. **Test ID Generation**: `onTestIdGenerated` is called when test IDs are generated
5. **Custom Commands**: Custom commands can be invoked via WebSocket messages

## Advanced Usage

### Custom Test ID Conventions

Define a custom test ID pattern:

```javascript
// telescope.config.js
module.exports = {
  testId: {
    convention: 'custom',
    customPattern: 'data-qa-{componentName}-{elementType}'
  }
};
```

### Multiple Editor Support

Configure for different editors:

```javascript
// telescope.config.js for VS Code
module.exports = {
  editor: {
    name: 'vscode',
    command: 'code',
    args: ['-g']
  }
};

// telescope.config.js for WebStorm
module.exports = {
  editor: {
    name: 'webstorm',
    command: 'webstorm',
    args: ['--line', '{line}', '{file}']
  }
};
```

### External AI Providers

Use OpenAI or Anthropic instead of Cursor's native AI:

```javascript
// telescope.config.js
module.exports = {
  ai: {
    enabled: true,
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  }
};
```

## Type Definitions

All TypeScript type definitions are available in `@@ruijadom/telescope/core`:

```typescript
import type {
  ComponentData,
  EditorCommand,
  TestIdSuggestion,
  TelescopeConfig,
  WebSocketMessage,
  HubblePlugin,
  ComponentTreeNode,
  MissingTestIdReport
} from '@@ruijadom/telescope/core';
```

## Examples

### Complete Integration Example

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { telescopePlugin } from '@@ruijadom/telescope/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    telescopePlugin({
      server: { port: 3737 },
      testId: { convention: 'data-testid' },
      ai: { enabled: true, provider: 'cursor-native' }
    })
  ]
});
```

```javascript
// telescope.config.js
module.exports = {
  editor: {
    name: 'cursor',
    command: 'cursor',
    args: ['-g']
  },
  testId: {
    convention: 'data-testid',
    autoGenerate: false
  },
  ai: {
    enabled: true,
    provider: 'cursor-native'
  },
  project: {
    roots: ['src'],
    extensions: ['.tsx', '.jsx'],
    exclude: ['node_modules', 'dist']
  },
  server: {
    port: 3737,
    host: 'localhost'
  }
};
```

## Support

For more information and support:

- [Main Documentation](../README.md)
- [Usage Guides](./USAGE.md)
- [GitHub Issues](https://github.com/yourusername/@ruijadom/telescope/issues)
