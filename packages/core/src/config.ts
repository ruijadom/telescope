import { TelescopeConfig } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration manager for Telescope
 * Handles loading, merging, and validating configuration
 */
export class ConfigManager {
  private config: TelescopeConfig;

  constructor(config?: TelescopeConfig) {
    this.config = config || ConfigManager.getDefaults();
  }

  /**
   * Loads configuration from telescope.config.js in project root
   */
  async load(projectRoot: string): Promise<TelescopeConfig> {
    const configPath = path.join(projectRoot, 'telescope.config.js');
    
    try {
      if (fs.existsSync(configPath)) {
        // Dynamic import for ES modules
        const userConfig = await import(configPath);
        const config = userConfig.default || userConfig;
        this.config = this.merge(config);
      } else {
        this.config = ConfigManager.getDefaults();
      }
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}, using defaults:`, error);
      this.config = ConfigManager.getDefaults();
    }

    this.validate(this.config);
    return this.config;
  }

  /**
   * Merges user configuration with defaults
   */
  private merge(userConfig: Partial<TelescopeConfig>): TelescopeConfig {
    const defaults = ConfigManager.getDefaults();
    
    return {
      editor: { ...defaults.editor, ...userConfig.editor },
      testId: { ...defaults.testId, ...userConfig.testId },
      ai: { ...defaults.ai, ...userConfig.ai },
      project: { ...defaults.project, ...userConfig.project },
      server: { ...defaults.server, ...userConfig.server },
    };
  }

  /**
   * Validates configuration for correctness
   */
  private validate(config: TelescopeConfig): void {
    if (!config.editor.command) {
      throw new Error('Editor command is required in configuration');
    }

    if (!config.server.port || config.server.port < 1024 || config.server.port > 65535) {
      throw new Error('Server port must be between 1024 and 65535');
    }

    if (!config.server.host) {
      throw new Error('Server host is required in configuration');
    }

    if (config.testId.convention === 'custom' && !config.testId.customPattern) {
      throw new Error('Custom test ID pattern is required when convention is "custom"');
    }

    if (config.ai.enabled && config.ai.provider !== 'cursor-native' && !config.ai.apiKey) {
      throw new Error('API key is required for non-cursor-native AI providers');
    }
  }

  /**
   * Returns the current configuration
   */
  getConfig(): TelescopeConfig {
    return this.config;
  }

  /**
   * Returns default configuration values
   */
  static getDefaults(): TelescopeConfig {
    return {
      editor: {
        name: 'cursor',
        command: 'cursor',
        args: ['-g'],
      },
      testId: {
        convention: 'data-testid',
        autoGenerate: true,
      },
      ai: {
        enabled: true,
        provider: 'cursor-native',
      },
      project: {
        roots: ['src'],
        extensions: ['.tsx', '.jsx', '.ts', '.js'],
        exclude: ['node_modules', 'dist', 'build', '.next', 'out'],
      },
      server: {
        port: 3737,
        host: 'localhost',
      },
    };
  }
}
