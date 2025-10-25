/**
 * Telescope CLI
 * Command line interface for Telescope
 */

import { Command } from 'commander';
import { initCommand, startCommand, stopCommand, statusCommand } from './commands/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Create CLI program
const program = new Command();

program
  .name('telescope')
  .description('Telescope - Navigate from browser components to editor source code')
  .version(packageJson.version, '-v, --version', 'Output the current version');

// Init command
program
  .command('init')
  .description('Initialize Telescope by creating a telescope.config.js file')
  .action(async () => {
    try {
      await initCommand(process.cwd());
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Start command
program
  .command('start')
  .description('Start the Telescope WebSocket server')
  .action(async () => {
    try {
      await startCommand(process.cwd());
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Stop command
program
  .command('stop')
  .description('Stop the running Telescope server')
  .action(async () => {
    try {
      await stopCommand(process.cwd());
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check the health status of the Telescope server')
  .action(async () => {
    try {
      await statusCommand(process.cwd());
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Help text
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ telescope init       # Create configuration file');
  console.log('  $ telescope start      # Start the server');
  console.log('  $ telescope status     # Check server status');
  console.log('  $ telescope stop       # Stop the server');
  console.log('');
  console.log('For more information, visit: https://github.com/ruijadom/telescope');
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
