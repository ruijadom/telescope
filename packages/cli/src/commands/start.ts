import { TelescopeServer } from '@ruijadom/telescope-core';
import { ConfigManager } from '@ruijadom/telescope-core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Starts the Hubble WebSocket server
 */
export async function startCommand(cwd: string = process.cwd()): Promise<void> {
  console.log('🚀 Starting React Telescope server...');

  try {
    // Load configuration
    const configManager = new ConfigManager();
    const config = await configManager.load(cwd);

    // Create and start server
    const server = new TelescopeServer(config);
    await server.start();

    // Write PID file for stop command
    const pidPath = path.join(cwd, '.hubble.pid');
    fs.writeFileSync(pidPath, process.pid.toString(), 'utf-8');

    console.log('');
    console.log('✅ React Telescope server is running');
    console.log(`   WebSocket: ws://${config.server.host}:${config.server.port}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');

    // Handle graceful shutdown
    const cleanup = async () => {
      console.log('\n🛑 Stopping React Telescope server...');
      await server.stop();
      
      // Remove PID file
      if (fs.existsSync(pidPath)) {
        fs.unlinkSync(pidPath);
      }
      
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    throw error;
  }
}
