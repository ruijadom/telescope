/**
 * AIService - AI-powered test ID generation and analysis
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import type { ComponentData, TestIdSuggestion, TelescopeConfig } from '@ruijadom/telescope-core';

export class AIService {
  private config: TelescopeConfig;

  constructor(config: TelescopeConfig) {
    this.config = config;
  }

  /**
   * Generates test ID suggestions using AI
   * @param componentData - Component information
   * @returns Array of test ID suggestions
   */
  async generateTestIds(componentData: ComponentData): Promise<TestIdSuggestion[]> {
    if (!this.config.ai.enabled) {
      throw new Error('AI service is not enabled in configuration');
    }

    // Detect project convention if not already set
    const convention = this.config.testId.convention === 'custom' && this.config.testId.customPattern
      ? this.config.testId.customPattern
      : await this.detectConvention(this.config.project.roots[0] || process.cwd());

    // Build the AI prompt
    const prompt = this.buildTestIdPrompt(componentData, convention);

    // Call AI API based on provider
    const response = await this.callAI(prompt);

    // Parse and return suggestions
    return this.parseTestIdResponse(response, componentData);
  }

  /**
   * Builds AI prompt for test ID generation
   * @param componentData - Component information
   * @param convention - Detected test ID convention
   * @returns Formatted prompt string
   */
  private buildTestIdPrompt(componentData: ComponentData, convention: string): string {
    const { name, props, testIds, filePath } = componentData;

    return `You are a helpful assistant that generates test IDs for React components.

Component Information:
- Name: ${name}
- File: ${filePath}
- Type: ${componentData.type}
- Existing Test IDs: ${testIds.length > 0 ? testIds.join(', ') : 'None'}

Component Props:
${JSON.stringify(props, null, 2)}

Project Test ID Convention:
- Attribute: ${convention}
- Naming Pattern: Use descriptive, hierarchical names (e.g., ${convention}="button-submit", ${convention}="input-email")

Task:
Analyze this component and suggest test IDs for interactive elements (buttons, inputs, links, forms, etc.).
For each suggestion, provide:
1. Element type (button, input, etc.)
2. Suggested test ID value (following the convention)
3. Reason for this test ID
4. Line number where it should be inserted (estimate based on typical component structure)

Format your response as a JSON array:
[
  {
    "elementType": "button",
    "suggestedId": "button-submit",
    "reason": "Primary submit button for the form",
    "insertionLine": 15
  }
]

Only suggest test IDs for elements that don't already have them. Focus on interactive elements that would be tested.`;
  }

  /**
   * Calls AI API based on configured provider
   * @param prompt - The prompt to send
   * @returns AI response text
   */
  private async callAI(prompt: string): Promise<string> {
    const { provider, model, apiKey } = this.config.ai;

    switch (provider) {
      case 'cursor-native':
        // For Cursor native AI, we would integrate with Cursor's API
        // This is a placeholder - actual implementation would depend on Cursor's API
        throw new Error('Cursor native AI integration not yet implemented. Please use OpenAI or Anthropic provider.');

      case 'openai':
        return this.callOpenAI(prompt, model, apiKey);

      case 'anthropic':
        return this.callAnthropic(prompt, model, apiKey);

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Calls OpenAI API
   */
  private async callOpenAI(prompt: string, model?: string, apiKey?: string): Promise<string> {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates test IDs for React components.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Calls Anthropic API
   */
  private async callAnthropic(prompt: string, model?: string, apiKey?: string): Promise<string> {
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.content[0]?.text || '';
  }

  /**
   * Parses AI response into structured suggestions
   * @param response - Raw AI response text
   * @param componentData - Original component data for context
   * @returns Array of test ID suggestions
   */
  private parseTestIdResponse(response: string, componentData: ComponentData): TestIdSuggestion[] {
    try {
      // Extract JSON from response (AI might wrap it in markdown code blocks)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsed)) {
        throw new Error('AI response is not an array');
      }

      // Convert to TestIdSuggestion format
      const convention = this.config.testId.convention === 'custom' && this.config.testId.customPattern
        ? this.config.testId.customPattern
        : this.config.testId.convention;

      return parsed.map((item: any) => ({
        elementType: item.elementType || 'unknown',
        suggestedId: item.suggestedId || '',
        reason: item.reason || 'No reason provided',
        insertionLine: item.insertionLine || componentData.lineNumber,
        attributeString: `${convention}="${item.suggestedId}"`,
      }));
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detects project test ID convention by scanning files
   * @param projectRoot - Root directory to scan
   * @returns Most common test ID convention
   */
  async detectConvention(projectRoot: string): Promise<string> {
    const files = this.findReactFiles(projectRoot);
    const patterns = this.scanForPatterns(files);

    // Find the most common pattern
    let maxCount = 0;
    let mostCommon = 'data-testid'; // default

    for (const [pattern, count] of patterns.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = pattern;
      }
    }

    return mostCommon;
  }

  /**
   * Finds React files in project
   */
  private findReactFiles(dir: string, files: string[] = []): string[] {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);

        // Skip excluded directories
        if (this.config.project.exclude.some(pattern => fullPath.includes(pattern))) {
          continue;
        }

        try {
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            // Recursively search directories
            this.findReactFiles(fullPath, files);
          } else if (stat.isFile()) {
            // Check if file has valid extension
            const ext = extname(fullPath);
            if (this.config.project.extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        } catch (err) {
          // Skip files we can't access
          continue;
        }
      }
    } catch (err) {
      // Skip directories we can't access
    }

    return files;
  }

  /**
   * Scans files for test ID patterns and counts occurrences
   * @param files - Array of file paths to scan
   * @returns Map of pattern to count
   */
  private scanForPatterns(files: string[]): Map<string, number> {
    const patterns = new Map<string, number>([
      ['data-testid', 0],
      ['data-test-id', 0],
      ['data-qa', 0],
      ['data-test', 0],
    ]);

    // Limit scanning to first 100 files for performance
    const filesToScan = files.slice(0, 100);

    for (const file of filesToScan) {
      try {
        const content = readFileSync(file, 'utf-8');

        // Count occurrences of each pattern
        for (const pattern of patterns.keys()) {
          const regex = new RegExp(pattern, 'g');
          const matches = content.match(regex);
          if (matches) {
            patterns.set(pattern, (patterns.get(pattern) || 0) + matches.length);
          }
        }
      } catch (err) {
        // Skip files we can't read
        continue;
      }
    }

    return patterns;
  }
}
