import * as fs from 'fs';
import * as path from 'path';

/**
 * Stops the running Telescope server
 */
export async function stopCommand(cwd: string = process.cwd()): Promise<void> {
  const pidPath = path.join(cwd, '.hubble.pid');

  try {
    // Check if PID file exists
    if (!fs.existsSync(pidPath)) {
      console.log('ℹ️  No running Telescope server found');
      return;
    }

    // Read PID
    const pid = parseInt(fs.readFileSync(pidPath, 'utf-8').trim(), 10);

    if (isNaN(pid)) {
      console.error('❌ Invalid PID file');
      fs.unlinkSync(pidPath);
      return;
    }

    // Check if process is running
    try {
      process.kill(pid, 0); // Check if process exists
    } catch (error) {
      console.log('ℹ️  Server process not found (may have already stopped)');
      fs.unlinkSync(pidPath);
      return;
    }

    // Stop the process
    console.log('🛑 Stopping React Telescope server...');
    process.kill(pid, 'SIGTERM');

    // Wait a bit and verify
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      process.kill(pid, 0);
      // If we get here, process is still running, force kill
      console.log('⚠️  Server did not stop gracefully, forcing...');
      process.kill(pid, 'SIGKILL');
    } catch {
      // Process stopped successfully
    }

    // Remove PID file
    if (fs.existsSync(pidPath)) {
      fs.unlinkSync(pidPath);
    }

    console.log('✅ React Telescope server stopped');
  } catch (error) {
    console.error('❌ Failed to stop server:', error);
    
    // Clean up PID file on error
    if (fs.existsSync(pidPath)) {
      fs.unlinkSync(pidPath);
    }
    
    throw error;
  }
}
