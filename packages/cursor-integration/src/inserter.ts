/**
 * CodeInserter - Inserts test IDs into source files
 */

import { readFileSync, writeFileSync } from 'fs';

export class CodeInserter {
  /**
   * Inserts test ID attribute into source file
   * @param filePath - Path to the source file
   * @param lineNumber - Line number where test ID should be inserted (1-indexed)
   * @param testIdAttribute - The test ID attribute string (e.g., 'data-testid="button-submit"')
   */
  async insertTestId(
    filePath: string,
    lineNumber: number,
    testIdAttribute: string
  ): Promise<void> {
    // Read the file
    const content = await this.readFile(filePath);

    // Find the insertion point
    const insertionPoint = this.findInsertionPoint(content, lineNumber);

    // Check if test ID already exists at this location
    if (this.hasExistingTestId(content, insertionPoint)) {
      throw new Error('Element already has a test ID attribute. Please remove it first or choose a different element.');
    }

    // Insert the attribute
    const modifiedContent = this.insertAttribute(content, insertionPoint, testIdAttribute);

    // Write back to file
    await this.writeFile(filePath, modifiedContent);
  }

  /**
   * Reads file content
   * @param filePath - Path to file
   * @returns File content as string
   */
  private async readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const content = readFileSync(filePath, 'utf-8');
        resolve(content);
      } catch (error) {
        reject(new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Writes content to file
   * @param filePath - Path to file
   * @param content - Content to write
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        writeFileSync(filePath, content, 'utf-8');
        resolve();
      } catch (error) {
        reject(new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Finds the insertion point in the file content
   * Parses JSX to locate the correct position for the test ID
   * @param content - File content
   * @param lineNumber - Target line number (1-indexed)
   * @returns Character position in the content string
   */
  private findInsertionPoint(content: string, lineNumber: number): number {
    const lines = content.split('\n');
    
    // Validate line number
    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(`Invalid line number: ${lineNumber}. File has ${lines.length} lines.`);
    }

    // Get the target line (convert to 0-indexed)
    const targetLineIndex = lineNumber - 1;
    const targetLine = lines[targetLineIndex];

    // Calculate the character position up to the target line
    let position = 0;
    for (let i = 0; i < targetLineIndex; i++) {
      position += lines[i].length + 1; // +1 for newline
    }

    // Find the opening tag on this line
    // Look for patterns like <button, <input, <div, etc.
    const tagMatch = targetLine.match(/<(\w+)([^>]*)/);
    
    if (!tagMatch) {
      // If no tag found on this line, insert at the end of the line
      return position + targetLine.length;
    }

    // Find where to insert the attribute
    // If the tag already has attributes, insert after them
    // If not, insert right after the tag name
    const tagName = tagMatch[1];
    const afterTagName = tagMatch[0];
    const attributesSection = tagMatch[2];

    // Position after the tag name
    const tagNamePosition = position + targetLine.indexOf(afterTagName) + tagName.length + 1; // +1 for '<'

    // If there are existing attributes, find the best insertion point
    if (attributesSection && attributesSection.trim().length > 0) {
      // Insert after existing attributes, before > or />
      const closeMatch = targetLine.match(/(\s*)(\/?>)/);
      if (closeMatch) {
        const closePosition = position + targetLine.indexOf(closeMatch[0]);
        return closePosition;
      }
    }

    // Insert right after tag name
    return tagNamePosition;
  }

  /**
   * Checks if element already has a test ID attribute
   * @param content - File content
   * @param position - Position to check around
   * @returns true if test ID exists
   */
  private hasExistingTestId(content: string, position: number): boolean {
    // Get a window of text around the position (500 chars before and after)
    const start = Math.max(0, position - 500);
    const end = Math.min(content.length, position + 500);
    const window = content.substring(start, end);

    // Check for common test ID patterns
    const testIdPatterns = [
      /data-testid\s*=/,
      /data-test-id\s*=/,
      /data-qa\s*=/,
      /data-test\s*=/,
    ];

    // Look for the opening tag and check if it has a test ID
    const tagMatch = window.match(/<\w+[^>]*>/);
    if (tagMatch) {
      const tag = tagMatch[0];
      return testIdPatterns.some(pattern => pattern.test(tag));
    }

    return false;
  }

  /**
   * Inserts attribute at the specified position
   * Preserves formatting and indentation
   * @param content - Original file content
   * @param position - Character position to insert at
   * @param attribute - Attribute string to insert
   * @returns Modified content
   */
  private insertAttribute(content: string, position: number, attribute: string): string {
    // Get the character at the position to determine spacing
    const charAtPosition = content[position];
    const charBefore = content[position - 1];

    // Determine if we need to add spacing
    let prefix = ' ';
    let suffix = '';

    // If we're right before a closing tag (> or />), add space before attribute
    if (charAtPosition === '>' || charAtPosition === '/') {
      prefix = ' ';
      suffix = '';
    }
    // If there's already whitespace, don't add extra
    else if (charBefore === ' ' || charBefore === '\t' || charBefore === '\n') {
      prefix = '';
    }

    // Insert the attribute
    const before = content.substring(0, position);
    const after = content.substring(position);
    
    return before + prefix + attribute + suffix + after;
  }
}
