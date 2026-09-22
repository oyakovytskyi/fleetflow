import type { FleetWsEvent } from '@fleetflow/shared-types';

import { env } from './env';
import { getAccessToken, getRefreshToken, getStoredUser, saveSession } from './auth';

type Handler = (event: FleetWsEvent) => void;
type StatusHandler = (status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') => void;

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 16_000;

export class AdminLiveSocket {
  private socket: WebSocket | null = null;
  private intentionalClose = false;
  private backoffMs = MIN_BACKOFF_MS;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly handlers = new Set<Handler>();
  private readonly statusHandlers = new Set<StatusHandler>();
  private refreshAttempted = false;

  connect() {
    this.intentionalClose = false;
    this.refreshAttempted = false;
    this.open();
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
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
    if (this.intentionalClose) return;
    const token = getAccessToken();
    if (!token) {
      this.emitStatus('DISCONNECTED');
      return;
    }
    if (this.timer) clearTimeout(this.timer);

    this.emitStatus(this.socket ? 'RECONNECTING' : 'DISCONNECTED');
    const url = `${env.wsUrl}/ws/live?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.backoffMs = MIN_BACKOFF_MS;
      this.refreshAttempted = false;
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

    socket.onclose = (event) => {
      this.socket = null;
      if (this.intentionalClose) {
        this.emitStatus('DISCONNECTED');
        return;
      }
      // Auth rejection before accept often surfaces as 1006/403-style close.
      if (!this.refreshAttempted && (event.code === 1008 || event.code === 1006 || event.code === 1002)) {
        this.refreshAttempted = true;
        void this.refreshThenReconnect();
        return;
      }
      this.emitStatus('RECONNECTING');
      const delay = this.backoffMs;
      this.backoffMs = Math.min(this.backoffMs * 2, MAX_BACKOFF_MS);
      this.timer = setTimeout(() => this.open(), delay);
    };
  }

  private async refreshThenReconnect() {
    const refreshToken = getRefreshToken();
    const user = getStoredUser();
    if (!refreshToken || !user) {
      this.emitStatus('DISCONNECTED');
      return;
    }
    try {
      const response = await fetch(`${env.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        this.emitStatus('DISCONNECTED');
        return;
      }
      const data = (await response.json()) as {
        accessToken?: string;
        refreshToken?: string;
      };
      if (!data.accessToken || !data.refreshToken) {
        this.emitStatus('DISCONNECTED');
        return;
      }
      saveSession(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        user,
      );
      this.open();
    } catch {
      this.emitStatus('DISCONNECTED');
    }
  }

  private emitStatus(status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING') {
    for (const handler of this.statusHandlers) handler(status);
  }
}
