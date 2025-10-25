# @ruijadom/telescope-cursor

Cursor editor integration for file opening, code insertion, and AI services.

## Installation

```bash
npm install @ruijadom/telescope-cursor
```

## What's Included

- **Cursor Opener**: Opens files in Cursor at specific line numbers
- **Code Inserter**: Inserts generated code into source files
- **AI Service**: Generates test IDs using Cursor's AI or external providers

## Usage

This package is used internally by Telescope. You generally don't need to use it directly.

### Opening Files

```typescript
import { CursorOpener } from '@ruijadom/telescope-cursor';

const opener = new CursorOpener(config);
await opener.open('/path/to/file.tsx', 42, 10);
```

### Inserting Code

```typescript
import { CodeInserter } from '@ruijadom/telescope-cursor';

const inserter = new CodeInserter(config);
await inserter.insertTestId('/path/to/file.tsx', 42, 'data-testid="my-button"');
```

### AI Services

```typescript
import { AIService } from '@ruijadom/telescope-cursor';

const ai = new AIService(config);
const suggestions = await ai.generateTestIds(componentData);
```

## Supported Editors

- Cursor (primary)
- VS Code (compatible)
- WebStorm (experimental)

## Documentation

For full documentation, see the [main Telescope repository](https://github.com/ruijadom/telescope).

## License

MIT
