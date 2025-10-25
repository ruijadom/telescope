/**
 * Integration tests for CursorOpener
 */

import { CursorOpener } from '../opener';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import type { TelescopeConfig } from '@ruijadom/telescope-core';

describe('CursorOpener Integration Tests', () => {
  const testDir = join(__dirname, 'test-files');
  const testFile = join(testDir, 'test-component.tsx');
  
  let mockConfig: TelescopeConfig;

  beforeEach(() => {
    // Create test directory and file
    mkdirSync(testDir, { recursive: true });
    writeFileSync(testFile, `
import React from 'react';

export const TestComponent = () => {
  return <div>Test</div>;
};
`, 'utf-8');

    // Mock configuration
    mockConfig = {
      editor: {
        name: 'cursor',
        command: 'echo',
        args: ['cursor'],
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: false,
      },
      ai: {
        enabled: false,
        provider: 'cursor-native',
      },
      project: {
        roots: [process.cwd()],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        exclude: ['node_modules', 'dist'],
      },
      server: {
        port: 3737,
        host: 'localhost',
      },
    };
  });

  afterEach(() => {
    // Clean up test files
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('openFile', () => {
    it('should open file with valid path and location', async () => {
      const opener = new CursorOpener(mockConfig);
      
      // Should not throw
      await expect(opener.openFile(testFile, 5, 10)).resolves.toBeUndefined();
    });

    it('should throw error for non-existent file', async () => {
      const opener = new CursorOpener(mockConfig);
      const nonExistentFile = join(testDir, 'non-existent.tsx');
      
      await expect(opener.openFile(nonExistentFile, 1, 1))
        .rejects.toThrow('File not found');
    });

    it('should successfully spawn process with valid command', async () => {
      const opener = new CursorOpener(mockConfig);
      
      // With echo command (which exists), should resolve successfully
      await expect(opener.openFile(testFile, 1, 1)).resolves.toBeUndefined();
    });
  });

  describe('buildCommand', () => {
    it('should construct correct command with goto arguments', () => {
      const opener = new CursorOpener(mockConfig);
      
      // Access private method through type assertion for testing
      const buildCommand = (opener as any).buildCommand.bind(opener);
      const command = buildCommand(testFile, 10, 5);
      
      expect(command).toEqual([
        'echo',
        'cursor',
        '-g',
        `${testFile}:10:5`,
      ]);
    });
  });

  describe('validateFile', () => {
    it('should return true for existing file', () => {
      const opener = new CursorOpener(mockConfig);
      const validateFile = (opener as any).validateFile.bind(opener);
      
      expect(validateFile(testFile)).toBe(true);
    });

    it('should return false for non-existent file', () => {
      const opener = new CursorOpener(mockConfig);
      const validateFile = (opener as any).validateFile.bind(opener);
      
      expect(validateFile(join(testDir, 'non-existent.tsx'))).toBe(false);
    });
  });
});
