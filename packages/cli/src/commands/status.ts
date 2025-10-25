import * as fs from 'fs';
import * as path from 'path';
import { WebSocket } from 'ws';

/**
 * Checks the health status of the Telescope server
 */
export async function statusCommand(cwd: string = process.cwd()): Promise<void> {
  const pidPath = path.join(cwd, '.hubble.pid');
  const configPath = path.join(cwd, 'hubble.config.js');

  console.log('🔍 Checking Telescope status...\n');

  // Check if config exists
  const hasConfig = fs.existsSync(configPath);
  console.log(`Configuration: ${hasConfig ? '✅ Found' : '❌ Not found'}`);
  if (!hasConfig) {
    console.log('   Run "hubble init" to create configuration');
  }

  // Check if PID file exists
  const hasPidFile = fs.existsSync(pidPath);
  console.log(`PID File: ${hasPidFile ? '✅ Found' : '❌ Not found'}`);

  if (!hasPidFile) {
    console.log('\n📊 Status: Server is not running');
    console.log('   Run "hubble start" to start the server');
    return;
  }

  // Read and validate PID
  const pid = parseInt(fs.readFileSync(pidPath, 'utf-8').trim(), 10);
  
  if (isNaN(pid)) {
    console.log('Process: ❌ Invalid PID');
    console.log('\n📊 Status: Server is not running (invalid PID file)');
    return;
  }

  // Check if process is running
  let processRunning = false;
  try {
    process.kill(pid, 0);
    processRunning = true;
    console.log(`Process: ✅ Running (PID: ${pid})`);
  } catch {
    console.log(`Process: ❌ Not running (PID: ${pid})`);
  }

  // Try to connect to WebSocket server
  if (processRunning) {
    try {
      // Load config to get server details
      let port = 3737;
      let host = 'localhost';
      
      if (hasConfig) {
        try {
          const config = await import(configPath);
          const telescopeConfig = config.default || config;
          port = telescopeConfig.server?.port || 3737;
          host = telescopeConfig.server?.host || 'localhost';
        } catch {
          // Use defaults if config can't be loaded
        }
      }

      const wsUrl = `ws://${host}:${port}`;
      const ws = new WebSocket(wsUrl);

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Connection timeout'));
        }, 3000);

        ws.on('open', () => {
          clearTimeout(timeout);
          ws.close();
          resolve();
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      console.log(`WebSocket: ✅ Responding at ${wsUrl}`);
      console.log('\n📊 Status: Server is healthy and running');
    } catch (error) {
      console.log('WebSocket: ❌ Not responding');
      console.log('\n📊 Status: Server process running but not responding');
      console.log('   Try stopping and restarting the server');
    }
  } else {
    console.log('\n📊 Status: Server is not running');
    console.log('   Run "hubble start" to start the server');
    
    // Clean up stale PID file
    if (fs.existsSync(pidPath)) {
      fs.unlinkSync(pidPath);
      console.log('   (Cleaned up stale PID file)');
    }
  }
}
