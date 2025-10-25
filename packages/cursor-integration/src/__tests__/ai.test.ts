/**
 * Integration tests for AIService
 */

import { AIService } from '../ai';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import type { ComponentData, TelescopeConfig } from '@ruijadom/telescope-core';

describe('AIService Integration Tests', () => {
  const testDir = join(__dirname, 'test-files-ai');
  
  let mockConfig: TelescopeConfig;
  let mockComponentData: ComponentData;

  beforeEach(() => {
    // Create test directory with sample files
    mkdirSync(testDir, { recursive: true });
    
    // Create sample files with test IDs
    writeFileSync(join(testDir, 'component1.tsx'), `
import React from 'react';

export const Component1 = () => {
  return (
    <div>
      <button data-testid="button-submit">Submit</button>
      <input data-testid="input-email" />
    </div>
  );
};
`, 'utf-8');

    writeFileSync(join(testDir, 'component2.tsx'), `
import React from 'react';

export const Component2 = () => {
  return (
    <div>
      <button data-testid="button-cancel">Cancel</button>
    </div>
  );
};
`, 'utf-8');

    // Mock configuration
    mockConfig = {
      editor: {
        name: 'cursor',
        command: 'cursor',
        args: [],
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: true,
      },
      ai: {
        enabled: true,
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-api-key',
      },
      project: {
        roots: [testDir],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        exclude: ['node_modules', 'dist'],
      },
      server: {
        port: 3737,
        host: 'localhost',
      },
    };

    // Mock component data
    mockComponentData = {
      name: 'TestComponent',
      filePath: join(testDir, 'component1.tsx'),
      lineNumber: 5,
      columnNumber: 10,
      props: {
        onClick: 'function',
        disabled: false,
      },
      testIds: [],
      type: 'functional',
      instanceId: 'test-instance-1',
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

  describe('detectConvention', () => {
    it('should detect data-testid as most common convention', async () => {
      const aiService = new AIService(mockConfig);
      
      const convention = await aiService.detectConvention(testDir);
      
      expect(convention).toBe('data-testid');
    });

    it('should return default when no test IDs found', async () => {
      const emptyDir = join(testDir, 'empty');
      mkdirSync(emptyDir, { recursive: true });
      
      const aiService = new AIService(mockConfig);
      const convention = await aiService.detectConvention(emptyDir);
      
      expect(convention).toBe('data-testid');
    });
  });

  describe('buildTestIdPrompt', () => {
    it('should build prompt with component information', () => {
      const aiService = new AIService(mockConfig);
      const buildPrompt = (aiService as any).buildTestIdPrompt.bind(aiService);
      
      const prompt = buildPrompt(mockComponentData, 'data-testid');
      
      expect(prompt).toContain('TestComponent');
      expect(prompt).toContain('data-testid');
      expect(prompt).toContain('functional');
      expect(prompt).toContain('onClick');
    });
  });

  describe('parseTestIdResponse', () => {
    it('should parse valid JSON response', () => {
      const aiService = new AIService(mockConfig);
      const parseResponse = (aiService as any).parseTestIdResponse.bind(aiService);
      
      const mockResponse = `[
        {
          "elementType": "button",
          "suggestedId": "button-submit",
          "reason": "Primary submit button",
          "insertionLine": 10
        }
      ]`;
      
      const suggestions = parseResponse(mockResponse, mockComponentData);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].elementType).toBe('button');
      expect(suggestions[0].suggestedId).toBe('button-submit');
      expect(suggestions[0].reason).toBe('Primary submit button');
      expect(suggestions[0].attributeString).toBe('data-testid="button-submit"');
    });

    it('should parse JSON wrapped in markdown code blocks', () => {
      const aiService = new AIService(mockConfig);
      const parseResponse = (aiService as any).parseTestIdResponse.bind(aiService);
      
      const mockResponse = `Here are the suggestions:
\`\`\`json
[
  {
    "elementType": "input",
    "suggestedId": "input-email",
    "reason": "Email input field",
    "insertionLine": 15
  }
]
\`\`\``;
      
      const suggestions = parseResponse(mockResponse, mockComponentData);
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].elementType).toBe('input');
    });

    it('should throw error for invalid JSON', () => {
      const aiService = new AIService(mockConfig);
      const parseResponse = (aiService as any).parseTestIdResponse.bind(aiService);
      
      const invalidResponse = 'This is not JSON';
      
      expect(() => parseResponse(invalidResponse, mockComponentData))
        .toThrow('No JSON array found in AI response');
    });
  });

  describe('generateTestIds', () => {
    it('should throw error when AI is disabled', async () => {
      const disabledConfig = {
        ...mockConfig,
        ai: {
          ...mockConfig.ai,
          enabled: false,
        },
      };
      
      const aiService = new AIService(disabledConfig);
      
      await expect(aiService.generateTestIds(mockComponentData))
        .rejects.toThrow('AI service is not enabled');
    });

    it('should throw error for unsupported provider', async () => {
      const invalidConfig = {
        ...mockConfig,
        ai: {
          ...mockConfig.ai,
          provider: 'cursor-native' as any,
        },
      };
      
      const aiService = new AIService(invalidConfig);
      
      await expect(aiService.generateTestIds(mockComponentData))
        .rejects.toThrow('Cursor native AI integration not yet implemented');
    });
  });

  describe('scanForPatterns', () => {
    it('should count test ID pattern occurrences', () => {
      const aiService = new AIService(mockConfig);
      const scanForPatterns = (aiService as any).scanForPatterns.bind(aiService);
      
      const files = [
        join(testDir, 'component1.tsx'),
        join(testDir, 'component2.tsx'),
      ];
      
      const patterns = scanForPatterns(files);
      
      expect(patterns.get('data-testid')).toBeGreaterThan(0);
      expect(patterns.get('data-test-id')).toBe(0);
    });
  });
});
