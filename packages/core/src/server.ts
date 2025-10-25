import { WebSocketServer, WebSocket } from 'ws';
import { TelescopeConfig, WebSocketMessage } from './types.js';
import { ConfigManager } from './config.js';

/**
 * WebSocket server for Telescope
 * Handles communication between browser runtime and editor integration
 */
export class TelescopeServer {
  private wss: WebSocketServer | null = null;
  private config: TelescopeConfig;
  private configManager: ConfigManager;

  constructor(config?: TelescopeConfig) {
    this.configManager = new ConfigManager(config);
    this.config = this.configManager.getConfig();
  }

  /**
   * Starts the WebSocket server
   */
  async start(): Promise<void> {
    const { host, port } = this.config.server;

    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ host, port });

        this.wss.on('listening', () => {
          console.log(`[Telescope Server] WebSocket server started on ws://${host}:${port}`);
          resolve();
        });

        this.wss.on('connection', (ws: WebSocket) => {
          this.handleConnection(ws);
        });

        this.wss.on('error', (error: Error) => {
          console.error('[Telescope Server] WebSocket server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stops the WebSocket server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          console.log('[Telescope Server] WebSocket server stopped');
          this.wss = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handles new WebSocket connections
   */
  private handleConnection(ws: WebSocket): void {
    console.log('[Telescope Server] New client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.routeMessage(message, ws);
      } catch (error) {
        console.error('[Telescope Server] Error processing message:', error);
        this.sendError(ws, 'unknown', error as Error);
      }
    });

    ws.on('close', () => {
      console.log('[Telescope Server] Client disconnected');
    });

    ws.on('error', (error: Error) => {
      console.error('[Telescope Server] WebSocket error:', error);
    });
  }

  /**
   * Routes incoming messages to appropriate handlers
   */
  private async routeMessage(message: WebSocketMessage, ws: WebSocket): Promise<void> {
    console.log(`[Telescope Server] Received message: ${message.type}`);

    try {
      switch (message.type) {
        case 'component-selected':
          await this.handleComponentSelected(message.payload, ws, message.requestId);
          break;
        case 'open-editor':
          await this.handleOpenEditor(message.payload, ws, message.requestId);
          break;
        case 'generate-testids':
          await this.handleGenerateTestIds(message.payload, ws, message.requestId);
          break;
        case 'insert-code':
          await this.handleInsertCode(message.payload, ws, message.requestId);
          break;
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.sendError(ws, message.requestId, error as Error);
    }
  }

  /**
   * Handles component selection message
   */
  private async handleComponentSelected(_payload: any, ws: WebSocket, requestId: string): Promise<void> {
    // Placeholder for component selection handling
    // Will be implemented in cursor-integration package
    this.sendResponse(ws, requestId, { status: 'acknowledged' });
  }

  /**
   * Handles open editor request
   */
  private async handleOpenEditor(_payload: any, ws: WebSocket, requestId: string): Promise<void> {
    // Placeholder for editor opening
    // Will be implemented in cursor-integration package
    this.sendResponse(ws, requestId, { status: 'pending' });
  }

  /**
   * Handles test ID generation request
   */
  private async handleGenerateTestIds(_payload: any, ws: WebSocket, requestId: string): Promise<void> {
    // Placeholder for test ID generation
    // Will be implemented in cursor-integration package
    this.sendResponse(ws, requestId, { status: 'pending' });
  }

  /**
   * Handles code insertion request
   */
  private async handleInsertCode(_payload: any, ws: WebSocket, requestId: string): Promise<void> {
    // Placeholder for code insertion
    // Will be implemented in cursor-integration package
    this.sendResponse(ws, requestId, { status: 'pending' });
  }

  /**
   * Sends response back to client
   */
  private sendResponse(ws: WebSocket, requestId: string, payload: any): void {
    const response: WebSocketMessage = {
      type: 'component-selected',
      payload,
      requestId,
      timestamp: Date.now(),
    };

    ws.send(JSON.stringify(response));
  }

  /**
   * Sends error response to client
   */
  private sendError(ws: WebSocket, requestId: string, error: Error): void {
    const errorMessage: WebSocketMessage = {
      type: 'error',
      payload: {
        message: error.message,
        stack: error.stack,
      },
      requestId,
      timestamp: Date.now(),
    };

    ws.send(JSON.stringify(errorMessage));
  }

  /**
   * Gets the current configuration
   */
  getConfig(): TelescopeConfig {
    return this.config;
  }
}
