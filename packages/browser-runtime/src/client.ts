/**
 * TelescopeClient - WebSocket client for browser-to-server communication
 */

import type { WebSocketMessage } from '@ruijadom/telescope-core';

type MessageHandler = (payload: any) => void;

export class TelescopeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageQueue: WebSocketMessage[] = [];
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isConnecting: boolean = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(url: string = 'ws://localhost:3737') {
    this.url = url;
  }

  /**
   * Connects to Telescope server
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[Telescope] Connected to server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (_error) => {
          console.error('[Telescope] WebSocket connection error');
          this.isConnecting = false;
        };

        this.ws.onclose = () => {
          console.log('[Telescope] Disconnected from server');
          this.isConnecting = false;
          this.ws = null;
          this.reconnect();
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            console.error('[Telescope] Connection timeout after 5 seconds');
            reject(new Error('Connection timeout after 5 seconds'));
          }
        }, 5000);
      } catch (error) {
        this.isConnecting = false;
        console.error('[Telescope] Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Sends message to server with request tracking
   */
  async send(message: Omit<WebSocketMessage, 'requestId' | 'timestamp'>): Promise<any> {
    const requestId = this.generateRequestId();
    const fullMessage: WebSocketMessage = {
      ...message,
      requestId,
      timestamp: Date.now(),
    };

    // If not connected, queue the message
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(fullMessage);
      // Try to connect
      this.connect().catch(error => {
        console.error('[Telescope] Failed to connect:', error);
      });
      
      // Return a promise that will be resolved when we get a response
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('Request timeout'));
          }
        }, 10000);
      });
    }

    // Send immediately if connected
    try {
      this.ws.send(JSON.stringify(fullMessage));
      
      // Return a promise that will be resolved when we get a response
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error('Request timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  /**
   * Handles incoming messages from server
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle response to pending request
      if (message.requestId && this.pendingRequests.has(message.requestId)) {
        const { resolve, reject } = this.pendingRequests.get(message.requestId)!;
        this.pendingRequests.delete(message.requestId);
        
        if (message.type === 'error') {
          reject(new Error(message.payload.message || 'Server error'));
        } else {
          resolve(message.payload);
        }
        return;
      }

      // Handle server-initiated messages
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.payload);
      }
    } catch (error) {
      console.error('[Telescope] Failed to handle message:', error);
    }
  }

  /**
   * Reconnects with exponential backoff strategy
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[Telescope] Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`[Telescope] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[Telescope] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Flushes queued messages after connection is established
   */
  private flushMessageQueue(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('[Telescope] Failed to send queued message:', error);
          // Put it back in the queue
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  /**
   * Registers a handler for server-initiated messages
   */
  on(messageType: string, handler: MessageHandler): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Removes a message handler
   */
  off(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Disconnects from server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageQueue = [];
    this.pendingRequests.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Generates unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Checks if client is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
