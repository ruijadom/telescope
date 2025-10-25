/**
 * Utility functions for Telescope
 */

/**
 * Generates a unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validates if a string is a valid file path
 */
export function isValidFilePath(filePath: string): boolean {
  return typeof filePath === 'string' && filePath.length > 0 && !filePath.includes('\0');
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"]/g, '');
}
