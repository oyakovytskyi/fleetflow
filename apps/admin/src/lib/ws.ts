import type { FleetWsEvent } from '@fleetflow/shared-types';

import { env } from './env';

type Handler = (event: FleetWsEvent) => void;
type StatusHandler = (status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') => void;

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 16_000;

export class AdminLiveSocket {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private intentionalClose = false;
  private backoffMs = MIN_BACKOFF_MS;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly handlers = new Set<Handler>();
  private readonly statusHandlers = new Set<StatusHandler>();

  connect(accessToken: string) {
    this.token = accessToken;
    this.intentionalClose = false;
    this.open();
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.token = null;
    this.socket?.close();
    this.socket = null;
    this.emitStatus('DISCONNECTED');
  }

  subscribe(handler: Handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private open() {
    if (!this.token || this.intentionalClose) return;
    if (this.timer) clearTimeout(this.timer);

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
        const event = JSON.parse(String(message.data)) as FleetWsEvent;
        for (const handler of this.handlers) handler(event);
      } catch {
        // ignore
      }
    };

    socket.onclose = () => {
      this.socket = null;
      if (this.intentionalClose || !this.token) {
        this.emitStatus('DISCONNECTED');
        return;
      }
      this.emitStatus('RECONNECTING');
      const delay = this.backoffMs;
      this.backoffMs = Math.min(this.backoffMs * 2, MAX_BACKOFF_MS);
      this.timer = setTimeout(() => this.open(), delay);
    };
  }

  private emitStatus(status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') {
    for (const handler of this.statusHandlers) handler(status);
  }
}
