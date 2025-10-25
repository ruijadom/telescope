/**
 * Integration tests for CodeInserter
 */

import { CodeInserter } from '../inserter';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('CodeInserter Integration Tests', () => {
  const testDir = join(__dirname, 'test-files-inserter');
  
  let inserter: CodeInserter;

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
    
    inserter = new CodeInserter();
  });

  afterEach(() => {
    // Clean up test files
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('insertTestId', () => {
    it('should insert test ID into simple button element', async () => {
      const testFile = join(testDir, 'simple-button.tsx');
      const originalContent = `import React from 'react';

export const SimpleButton = () => {
  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
};`;
      
      writeFileSync(testFile, originalContent, 'utf-8');
      
      await inserter.insertTestId(testFile, 5, 'data-testid="button-click"');
      
      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).toContain('data-testid="button-click"');
      expect(modifiedContent).toContain('<button');
    });

    it('should insert test ID into element with existing attributes', async () => {
      const testFile = join(testDir, 'button-with-attrs.tsx');
      const originalContent = `import React from 'react';

export const ButtonWithAttrs = () => {
  return (
    <button className="btn" onClick={handleClick}>
      Submit
    </button>
  );
};`;
      
      writeFileSync(testFile, originalContent, 'utf-8');
      
      await inserter.insertTestId(testFile, 5, 'data-testid="button-submit"');
      
      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).toContain('data-testid="button-submit"');
      expect(modifiedContent).toContain('className="btn"');
    });

    it('should insert test ID into self-closing element', async () => {
      const testFile = join(testDir, 'input.tsx');
      const originalContent = `import React from 'react';

export const InputField = () => {
  return (
    <input type="text" placeholder="Enter email" />
  );
};`;
      
      writeFileSync(testFile, originalContent, 'utf-8');
      
      await inserter.insertTestId(testFile, 5, 'data-testid="input-email"');
      
      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).toContain('data-testid="input-email"');
      expect(modifiedContent).toContain('type="text"');
    });

    it('should preserve indentation and formatting', async () => {
      const testFile = join(testDir, 'formatted.tsx');
      const originalContent = `import React from 'react';

export const FormattedComponent = () => {
  return (
    <div>
      <button
        className="primary"
        onClick={handleClick}
      >
        Click
      </button>
    </div>
  );
};`;
      
      writeFileSync(testFile, originalContent, 'utf-8');
      
      await inserter.insertTestId(testFile, 6, 'data-testid="button-primary"');
      
      const modifiedContent = readFileSync(testFile, 'utf-8');
      expect(modifiedContent).toContain('data-testid="button-primary"');
      
      // Check that indentation is preserved
      const lines = modifiedContent.split('\n');
      expect(lines[5].startsWith('      <button')).toBe(true);
    });

    it('should throw error for non-existent file', async () => {
      const nonExistentFile = join(testDir, 'non-existent.tsx');
      
      await expect(inserter.insertTestId(nonExistentFile, 1, 'data-testid="test"'))
        .rejects.toThrow('Failed to read file');
    });

    it('should throw error for invalid line number', async () => {
      const testFile = join(testDir, 'invalid-line.tsx');
      writeFileSync(testFile, 'const x = 1;\n', 'utf-8');
      
      await expect(inserter.insertTestId(testFile, 100, 'data-testid="test"'))
        .rejects.toThrow('Invalid line number');
    });

    it('should throw error when test ID already exists', async () => {
      const testFile = join(testDir, 'existing-testid.tsx');
      const originalContent = `import React from 'react';

export const ExistingTestId = () => {
  return (
    <button data-testid="existing-id">Click</button>
  );
};`;
      
      writeFileSync(testFile, originalContent, 'utf-8');
      
      await expect(inserter.insertTestId(testFile, 5, 'data-testid="new-id"'))
        .rejects.toThrow('Element already has a test ID attribute');
    });
  });

  describe('findInsertionPoint', () => {
    it('should find correct insertion point for simple tag', () => {
      const content = '<button>Click</button>';
      const findInsertionPoint = (inserter as any).findInsertionPoint.bind(inserter);
      
      const position = findInsertionPoint(content, 1);
      
      expect(position).toBeGreaterThan(0);
      expect(position).toBeLessThan(content.length);
    });

    it('should handle multi-line content', () => {
      const content = `line 1
line 2
<button>Click</button>
line 4`;
      const findInsertionPoint = (inserter as any).findInsertionPoint.bind(inserter);
      
      const position = findInsertionPoint(content, 3);
      
      expect(position).toBeGreaterThan(14); // After first two lines
    });
  });

  describe('insertAttribute', () => {
    it('should insert attribute with proper spacing', () => {
      const content = '<button>Click</button>';
      const insertAttribute = (inserter as any).insertAttribute.bind(inserter);
      
      const modified = insertAttribute(content, 7, 'data-testid="test"');
      
      expect(modified).toContain('data-testid="test"');
      expect(modified).toContain('<button');
    });

    it('should handle insertion before closing tag', () => {
      const content = '<button className="btn">Click</button>';
      const insertAttribute = (inserter as any).insertAttribute.bind(inserter);
      
      const position = content.indexOf('>');
      const modified = insertAttribute(content, position, 'data-testid="test"');
      
      expect(modified).toContain('data-testid="test"');
      expect(modified).toContain('className="btn"');
    });
  });

  describe('hasExistingTestId', () => {
    it('should detect existing data-testid', () => {
      const content = '<button data-testid="existing">Click</button>';
      const hasExistingTestId = (inserter as any).hasExistingTestId.bind(inserter);
      
      const hasTestId = hasExistingTestId(content, 10);
      
      expect(hasTestId).toBe(true);
    });

    it('should detect existing data-test-id', () => {
      const content = '<button data-test-id="existing">Click</button>';
      const hasExistingTestId = (inserter as any).hasExistingTestId.bind(inserter);
      
      const hasTestId = hasExistingTestId(content, 10);
      
      expect(hasTestId).toBe(true);
    });

    it('should return false when no test ID exists', () => {
      const content = '<button className="btn">Click</button>';
      const hasExistingTestId = (inserter as any).hasExistingTestId.bind(inserter);
      
      const hasTestId = hasExistingTestId(content, 10);
      
      expect(hasTestId).toBe(false);
    });
  });

  describe('readFile and writeFile', () => {
    it('should read and write file correctly', async () => {
      const testFile = join(testDir, 'read-write.txt');
      const content = 'Test content';
      
      writeFileSync(testFile, content, 'utf-8');
      
      const readFile = (inserter as any).readFile.bind(inserter);
      const writeFile = (inserter as any).writeFile.bind(inserter);
      
      const readContent = await readFile(testFile);
      expect(readContent).toBe(content);
      
      const newContent = 'New content';
      await writeFile(testFile, newContent);
      
      const updatedContent = readFileSync(testFile, 'utf-8');
      expect(updatedContent).toBe(newContent);
    });
  });
});
