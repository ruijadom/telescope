import * as fs from 'fs';
import * as path from 'path';

/**
 * Initializes Telescope by generating a telescope.config.js file
 */
export async function initCommand(cwd: string = process.cwd()): Promise<void> {
  const configPath = path.join(cwd, 'telescope.config.js');

  // Check if config already exists
  if (fs.existsSync(configPath)) {
    console.log('⚠️  telescope.config.js already exists');
    console.log('   Delete it first if you want to regenerate');
    return;
  }

  // Generate default config file
  const configContent = `/**
 * Telescope Configuration
 * @type {import('@ruijadom/telescope-core').TelescopeConfig}
 */
export default {
  // Editor configuration
  editor: {
    name: 'cursor',
    command: 'cursor',
    args: ['-g'],
  },

  // Test ID configuration
  testId: {
    convention: 'data-testid', // 'data-testid' | 'data-test-id' | 'data-qa' | 'custom'
    autoGenerate: true,
    // customPattern: 'data-custom', // Required if convention is 'custom'
  },

  // AI configuration
  ai: {
    enabled: true,
    provider: 'cursor-native', // 'cursor-native' | 'openai' | 'anthropic'
    // model: 'gpt-4', // Optional: specify model
    // apiKey: process.env.OPENAI_API_KEY, // Required for non-cursor-native providers
  },

  // Project structure
  project: {
    roots: ['src'],
    extensions: ['.tsx', '.jsx', '.ts', '.js'],
    exclude: ['node_modules', 'dist', 'build', '.next', 'out'],
  },

  // Server configuration
  server: {
    port: 3737,
    host: 'localhost',
  },
};
`;

  try {
    fs.writeFileSync(configPath, configContent, 'utf-8');
    console.log('✅ Created telescope.config.js');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review and customize telescope.config.js');
    console.log('  2. Add Telescope plugin to your build tool (Vite or Webpack)');
    console.log('  3. Run "telescope start" to launch the server');
  } catch (error) {
    console.error('❌ Failed to create telescope.config.js:', error);
    throw error;
  }
}
