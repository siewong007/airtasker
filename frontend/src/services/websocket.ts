import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type MessageHandler = (message: unknown) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, { id: string; handler: MessageHandler }> = new Map();
  private connected = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.client?.active) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          this.connected = true;
          // Re-subscribe after reconnection
          this.subscriptions.forEach((sub, destination) => {
            this.doSubscribe(destination, sub.handler);
          });
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          reject(new Error(frame.headers?.message || 'STOMP connection error'));
        },
        onDisconnect: () => {
          this.connected = false;
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  subscribe(destination: string, handler: MessageHandler): () => void {
    this.subscriptions.set(destination, { id: '', handler });

    if (this.connected && this.client?.active) {
      this.doSubscribe(destination, handler);
    }

    return () => this.unsubscribe(destination);
  }

  private doSubscribe(destination: string, handler: MessageHandler) {
    if (!this.client?.active) return;

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        handler(data);
      } catch {
        handler(message.body);
      }
    });

    const existing = this.subscriptions.get(destination);
    if (existing) {
      existing.id = subscription.id;
    }
  }

  private unsubscribe(destination: string) {
    const sub = this.subscriptions.get(destination);
    if (sub?.id && this.client?.active) {
      this.client.unsubscribe(sub.id);
    }
    this.subscriptions.delete(destination);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();
