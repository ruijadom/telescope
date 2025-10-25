import type { Plugin, ViteDevServer } from 'vite';
import type { TelescopeConfig } from '@ruijadom/telescope-core';
import { TelescopeServer } from '@ruijadom/telescope-core';
import { ComponentTransformer } from './transformer';

/**
 * Vite plugin for Telescope integration
 * Injects browser runtime and starts Telescope server in development mode
 */
export function telescopePlugin(options?: Partial<TelescopeConfig>): Plugin {
  let server: TelescopeServer | null = null;
  let transformer: ComponentTransformer;
  let isDev = false;

  return {
    name: 'telescope',

    /**
     * Configure plugin based on Vite mode
     */
    config(config, { command }) {
      isDev = command === 'serve';
      return config;
    },

    /**
     * Injects Hubble runtime script into HTML
     */
    transformIndexHtml(html: string) {
      // Only inject in development mode
      if (!isDev) {
        return html;
      }

      // Inject browser runtime script before closing body tag
      const scriptTag = `
  <script type="module">
    // Import and initialize Telescope browser runtime
    import '/@react-hubble/browser-runtime';
  </script>`;

      // Insert before closing body tag, or at end if no body tag
      if (html.includes('</body>')) {
        return html.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        return html + scriptTag;
      }
    },

    /**
     * Configures dev server to start Telescope server and serve browser runtime
     */
    async configureServer(viteServer: ViteDevServer) {
      // Only run in development mode
      if (!isDev) {
        return;
      }

      // Initialize transformer
      transformer = new ComponentTransformer();

      // Start Hubble WebSocket server
      try {
        server = new TelescopeServer(options as TelescopeConfig);
        await server.start();
        console.log('[Telescope] Server started successfully');
      } catch (error) {
        console.error('[Telescope] Failed to start server:', error);
      }

      // Add middleware to serve browser runtime
      viteServer.middlewares.use((req, _res, next) => {
        // Serve browser runtime bundle
        if (req.url === '/@react-hubble/browser-runtime') {
          // Vite will handle the module resolution
          // We just need to ensure the path is recognized
          next();
        } else {
          next();
        }
      });

      // Handle server close
      viteServer.httpServer?.on('close', async () => {
        if (server) {
          await server.stop();
          console.log('[Telescope] Server stopped');
        }
      });
    },

    /**
     * Transform React component files to add metadata (optional)
     */
    transform(code: string, id: string) {
      // Only transform in development mode
      if (!isDev) {
        return null;
      }

      // Only process React component files
      const isReactFile = /\.(jsx|tsx)$/.test(id);
      const isInNodeModules = id.includes('node_modules');

      if (!isReactFile || isInNodeModules) {
        return null;
      }

      // Check if file contains React components
      const hasReactComponent = /(?:function|const|class)\s+\w+.*(?:React\.Component|:\s*React\.FC|:\s*FC)/.test(code) ||
                                /export\s+(?:default\s+)?(?:function|const|class)/.test(code);

      if (!hasReactComponent) {
        return null;
      }

      try {
        // Transform component to add metadata
        const result = transformer.transform(code, id);
        return result;
      } catch (error) {
        // Log error but don't break the build
        console.warn(`[Telescope] Failed to transform ${id}:`, error);
        return null;
      }
    },

    /**
     * Cleanup when build ends
     */
    async buildEnd() {
      if (server) {
        await server.stop();
        server = null;
      }
    },
  };
}
