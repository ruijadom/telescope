import type { Compiler, Compilation } from 'webpack';
import type { TelescopeConfig } from '@ruijadom/telescope-core';
import { TelescopeServer } from '@ruijadom/telescope-core';
import * as path from 'path';

/**
 * Webpack plugin for Telescope integration
 * Injects browser runtime and starts Telescope server in development mode
 */
export class TelescopeWebpackPlugin {
  private options: Partial<TelescopeConfig>;
  private server: TelescopeServer | null = null;

  constructor(options: Partial<TelescopeConfig> = {}) {
    this.options = options;
  }

  /**
   * Apply plugin to Webpack compiler
   */
  apply(compiler: Compiler): void {
    const isDev = compiler.options.mode === 'development';

    // Only run in development mode
    if (!isDev) {
      return;
    }

    const pluginName = 'ReactHubbleWebpackPlugin';

    // Register custom loader for React component transformation
    this.registerLoader(compiler);

    // Hook into compilation to inject browser runtime
    compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
      // Hook into HtmlWebpackPlugin if available
      this.injectIntoHtml(compilation);
    });

    // Start Telescope server when compiler starts
    compiler.hooks.beforeRun.tapAsync(pluginName, async (_compiler, callback) => {
      await this.startServer();
      callback();
    });

    compiler.hooks.watchRun.tapAsync(pluginName, async (_compiler, callback) => {
      if (!this.server) {
        await this.startServer();
      }
      callback();
    });

    // Stop server when compiler closes
    compiler.hooks.done.tap(pluginName, () => {
      // Keep server running in watch mode
    });

    compiler.hooks.failed.tap(pluginName, async () => {
      await this.stopServer();
    });

    // Handle process exit
    process.on('SIGINT', async () => {
      await this.stopServer();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.stopServer();
      process.exit(0);
    });
  }

  /**
   * Register custom loader for React component transformation
   */
  private registerLoader(compiler: Compiler): void {
    // Add rule to use our custom loader for React files
    const loaderPath = path.resolve(__dirname, 'loader.js');

    // Modify module rules to include our loader
    compiler.options.module = compiler.options.module || { rules: [] };
    compiler.options.module.rules = compiler.options.module.rules || [];

    // Add our loader rule
    compiler.options.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: /node_modules/,
      enforce: 'post' as const,
      use: [
        {
          loader: loaderPath,
          options: this.options,
        },
      ],
    });
  }

  /**
   * Inject browser runtime script into HTML using HtmlWebpackPlugin
   */
  private injectIntoHtml(compilation: Compilation): void {
    // Check if HtmlWebpackPlugin is available
    const HtmlWebpackPlugin = this.getHtmlWebpackPlugin();

    if (!HtmlWebpackPlugin) {
      console.warn('[Telescope] HtmlWebpackPlugin not found. Browser runtime will not be injected automatically.');
      return;
    }

    // Hook into HtmlWebpackPlugin's alterAssetTagGroups hook
    const hooks = HtmlWebpackPlugin.getHooks(compilation);

    hooks.alterAssetTagGroups.tapAsync(
      'ReactHubbleWebpackPlugin',
      (data: any, callback: (error: Error | null, data?: any) => void) => {
        // Inject browser runtime script tag
        const scriptTag = {
          tagName: 'script',
          voidTag: false,
          meta: { plugin: 'react-hubble' },
          attributes: {
            type: 'module',
            src: '/__react-hubble__/browser-runtime.js',
          },
        };

        // Add script to body tags
        data.bodyTags.push(scriptTag);

        callback(null, data);
      }
    );

    // Add virtual module for browser runtime
    compilation.hooks.additionalAssets.tapAsync(
      'ReactHubbleWebpackPlugin',
      (callback: (error?: Error) => void) => {
        // Create virtual asset for browser runtime
        const runtimePath = require.resolve('@react-hubble/browser-runtime');
        const fs = require('fs');

        try {
          const runtimeCode = fs.readFileSync(runtimePath, 'utf-8');

          // Emit the browser runtime as an asset
          const { RawSource } = compilation.compiler.webpack.sources;
          compilation.emitAsset(
            '__react-hubble__/browser-runtime.js',
            new RawSource(runtimeCode)
          );

          callback();
        } catch (error) {
          console.error('[Telescope] Failed to load browser runtime:', error);
          callback();
        }
      }
    );
  }

  /**
   * Get HtmlWebpackPlugin if available
   */
  private getHtmlWebpackPlugin(): any {
    try {
      // Try to require HtmlWebpackPlugin
      return require('html-webpack-plugin');
    } catch (error) {
      return null;
    }
  }

  /**
   * Start Hubble WebSocket server
   */
  private async startServer(): Promise<void> {
    if (this.server) {
      return;
    }

    try {
      this.server = new TelescopeServer(this.options as TelescopeConfig);
      await this.server.start();
      console.log('[Telescope] Server started successfully');
    } catch (error) {
      console.error('[Telescope] Failed to start server:', error);
    }
  }

  /**
   * Stop Hubble WebSocket server
   */
  private async stopServer(): Promise<void> {
    if (this.server) {
      await this.server.stop();
      this.server = null;
      console.log('[Telescope] Server stopped');
    }
  }
}
