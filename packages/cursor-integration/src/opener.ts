/**
 * CursorOpener - Opens files in Cursor editor at specific locations
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import type { TelescopeConfig } from '@ruijadom/telescope-core';

export class CursorOpener {
  private config: TelescopeConfig;

  constructor(config: TelescopeConfig) {
    this.config = config;
  }

  /**
   * Opens file in Cursor at specific location
   * @param filePath - Absolute path to the file
   * @param line - Line number (1-indexed)
   * @param column - Column number (1-indexed)
   */
  async openFile(filePath: string, line: number, column: number): Promise<void> {
    // Validate file exists before attempting to open
    if (!this.validateFile(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Build the command with arguments
    const command = this.buildCommand(filePath, line, column);

    // Execute the command
    await this.executeCommand(command);
  }

  /**
   * Constructs Cursor command with arguments
   * Uses -g flag for goto functionality
   * @param filePath - Absolute path to the file
   * @param line - Line number
   * @param column - Column number
   * @returns Command array [command, ...args]
   */
  private buildCommand(filePath: string, line: number, column: number): string[] {
    const { command, args } = this.config.editor;
    
    // Build the goto argument: -g file:line:column
    const gotoArg = `-g`;
    const locationArg = `${filePath}:${line}:${column}`;
    
    // Combine configured args with goto args
    return [command, ...args, gotoArg, locationArg];
  }

  /**
   * Executes shell command to open Cursor
   * @param command - Command array [command, ...args]
   */
  private executeCommand(command: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command;

      // Spawn the process
      const process = spawn(cmd, args, {
        detached: true,
        stdio: 'ignore',
      });

      // Handle errors
      process.on('error', (error) => {
        if (error.message.includes('ENOENT')) {
          reject(new Error(
            `Cursor editor not found. Please ensure Cursor is installed and the command '${cmd}' is available in your PATH.`
          ));
        } else {
          reject(new Error(`Failed to open Cursor: ${error.message}`));
        }
      });

      // Detach the process so it runs independently
      process.unref();

      // Resolve immediately after spawning (don't wait for Cursor to close)
      resolve();
    });
  }

  /**
   * Validates file exists before opening
   * @param filePath - Path to validate
   * @returns true if file exists, false otherwise
   */
  private validateFile(filePath: string): boolean {
    return existsSync(filePath);
  }
}
