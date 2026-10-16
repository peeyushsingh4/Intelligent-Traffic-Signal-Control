import { Transaction, StreamStats, FlaggedEvent } from './types';

export interface WebSocketMessage {
  type: 'HANDSHAKE' | 'TRANSACTION_EVENT' | 'PONG';
  message?: string;
  data?: Transaction;
  stats?: StreamStats;
  alert?: FlaggedEvent | null;
}

type MessageListener = (msg: WebSocketMessage) => void;

class StreamWebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Set<MessageListener> = new Set();
  private reconnectTimer: number | null = null;
  private isExplicitlyClosed = false;

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const defaultUrl = `${protocol}//${host}/api/ws/live`;
    const wsUrl = import.meta.env.VITE_WS_URL || defaultUrl;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed: WebSocketMessage = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(parsed));
        } catch {
          // Ignore parse error
        }
      };

      this.socket.onclose = () => {
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2500);
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsClient = new StreamWebSocketClient();
