/**
 * Custom error classes for Telescope
 */

export class ComponentDetectionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ComponentDetectionError';
    Object.setPrototypeOf(this, ComponentDetectionError.prototype);
  }
}

export class WebSocketError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'WebSocketError';
    Object.setPrototypeOf(this, WebSocketError.prototype);
  }
}

export class EditorError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'EditorError';
    Object.setPrototypeOf(this, EditorError.prototype);
  }
}

export class AIError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'AIError';
    Object.setPrototypeOf(this, AIError.prototype);
  }
}

/**
 * Centralized error handler for Telescope
 */
export class ErrorHandler {
  private retryAttempts: Map<string, number> = new Map();

  /**
   * Handles errors with appropriate recovery strategy
   */
  handle(error: Error, context: string): void {
    // Log all errors for debugging
    console.error(`[Telescope] ${context}:`, error);

    if (error instanceof ComponentDetectionError) {
      this.handleComponentDetectionError(error);
    } else if (error instanceof WebSocketError) {
      this.handleWebSocketError(error);
    } else if (error instanceof EditorError) {
      this.handleEditorError(error);
    } else if (error instanceof AIError) {
      this.handleAIError(error);
    } else {
      this.handleGenericError(error, context);
    }
  }

  /**
   * Handles component detection errors
   */
  private handleComponentDetectionError(error: ComponentDetectionError): void {
    const message = this.getUserFriendlyMessage(error);
    console.warn(`[Telescope] Component Detection: ${message}`);
    
    // In browser context, this would show an overlay error
    if (typeof window !== 'undefined') {
      this.showBrowserError(message);
    }
  }

  /**
   * Handles WebSocket errors
   */
  private handleWebSocketError(error: WebSocketError): void {
    const message = this.getUserFriendlyMessage(error);
    console.warn(`[Telescope] WebSocket: ${message}`);
    
    // WebSocket errors typically trigger reconnection logic
    // This is handled by the TelescopeClient itself
  }

  /**
   * Handles editor errors
   */
  private handleEditorError(error: EditorError): void {
    const message = this.getUserFriendlyMessage(error);
    console.error(`[Telescope] Editor: ${message}`);
    
    // In browser context, show fallback options
    if (typeof window !== 'undefined') {
      this.showBrowserError(message);
    }
  }

  /**
   * Handles AI service errors
   */
  private handleAIError(error: AIError): void {
    const message = this.getUserFriendlyMessage(error);
    console.error(`[Telescope] AI Service: ${message}`);
    
    // In browser context, offer manual test ID entry
    if (typeof window !== 'undefined') {
      this.showBrowserError(message);
    }
  }

  /**
   * Handles generic errors
   */
  private handleGenericError(error: Error, context: string): void {
    console.error(`[Telescope] Unexpected error in ${context}:`, error);
  }

  /**
   * Shows error in browser UI
   */
  private showBrowserError(message: string): void {
    // This would be implemented by the browser runtime
    // For now, just log to console
    console.error(`[Telescope] ${message}`);
  }

  /**
   * Generates user-friendly error messages
   */
  getUserFriendlyMessage(error: Error): string {
    if (error instanceof ComponentDetectionError) {
      return 'Could not detect component. Make sure React DevTools is enabled and the element is a React component.';
    } else if (error instanceof WebSocketError) {
      return 'Connection to Telescope server lost. Attempting to reconnect...';
    } else if (error instanceof EditorError) {
      if (error.message.includes('not found')) {
        return 'Could not open file in editor. Please ensure Cursor is installed and accessible.';
      } else if (error.message.includes('permission')) {
        return 'Permission denied when opening file. Please check file permissions.';
      }
      return 'Could not open file in editor. Please try again or open the file manually.';
    } else if (error instanceof AIError) {
      if (error.message.includes('rate limit')) {
        return 'AI service rate limit exceeded. Please try again in a few moments.';
      } else if (error.message.includes('timeout')) {
        return 'AI service request timed out. Please try again.';
      }
      return 'Could not generate test IDs. You can enter test IDs manually.';
    }
    return error.message || 'An unexpected error occurred.';
  }

  /**
   * Implements exponential backoff for retries
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    operationId?: string
  ): Promise<T> {
    const id = operationId || 'default';
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        // Reset retry count on success
        this.retryAttempts.delete(id);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.retryAttempts.set(id, i + 1);

        if (i === maxRetries - 1) {
          // Max retries reached
          console.error(`[Telescope] Max retries (${maxRetries}) reached for ${id}`);
          throw lastError;
        }

        // Calculate backoff delay: 2^i * 1000ms (1s, 2s, 4s, ...)
        const delay = Math.pow(2, i) * 1000;
        console.warn(
          `[Telescope] Retry ${i + 1}/${maxRetries} for ${id} after ${delay}ms`
        );
        await this.delay(delay);
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Delays execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets the current retry attempt count for an operation
   */
  getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }

  /**
   * Resets retry count for an operation
   */
  resetRetryCount(operationId: string): void {
    this.retryAttempts.delete(operationId);
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
