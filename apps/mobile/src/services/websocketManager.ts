import type { FleetWsEvent, WsConnectionStatus } from '@fleetflow/shared-types';

import { env } from '@/src/config/env';

type EventHandler = (event: FleetWsEvent) => void;
type StatusHandler = (status: WsConnectionStatus) => void;

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 16_000;

/**
 * Browser/RN WebSocket client with exponential reconnect.
 * Auth token is passed as `?token=` because the WebSocket API cannot set headers.
 */
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private intentionalClose = false;
  private backoffMs = MIN_BACKOFF_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly handlers = new Set<EventHandler>();
  private readonly statusHandlers = new Set<StatusHandler>();

  connect(accessToken: string): void {
    this.token = accessToken;
    this.intentionalClose = false;
    this.openSocket();
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnect();
    this.token = null;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.emitStatus('DISCONNECTED');
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  send(payload: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    }
  }

  private openSocket(): void {
    if (!this.token || this.intentionalClose) {
      return;
    }

    this.clearReconnect();
    this.emitStatus(this.socket ? 'RECONNECTING' : 'DISCONNECTED');

    const url = `${env.wsUrl}/ws/live?token=${encodeURIComponent(this.token)}`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.backoffMs = MIN_BACKOFF_MS;
      this.emitStatus('CONNECTED');
    };

    socket.onmessage = (message) => {
      try {
        const parsed = JSON.parse(String(message.data)) as FleetWsEvent;
        for (const handler of this.handlers) {
          handler(parsed);
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    socket.onerror = () => {
      // onclose handles reconnect.
    };

    socket.onclose = () => {
      this.socket = null;
      if (this.intentionalClose || !this.token) {
        this.emitStatus('DISCONNECTED');
        return;
      }
      this.emitStatus('RECONNECTING');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    const delay = this.backoffMs;
    this.backoffMs = Math.min(this.backoffMs * 2, MAX_BACKOFF_MS);
    this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emitStatus(status: WsConnectionStatus): void {
    for (const handler of this.statusHandlers) {
      handler(status);
    }
  }
}

export const websocketManager = new WebSocketManager();
