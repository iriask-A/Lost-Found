import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  is_own?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8000/api';
  private wsUrl = 'ws://localhost:8000/ws/chat/general/';
  private socket: WebSocket | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  private statusSubject = new BehaviorSubject<'connecting' | 'connected' | 'disconnected'>('disconnected');
  status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  connect(username: string): void {
    this.statusSubject.next('connecting');
    this.loadHistory();

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.statusSubject.next('connected');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const msg: ChatMessage = {
          id: Date.now(),
          username: data.username,
          message: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
          is_own: data.username === username,
        };
        const current = this.messagesSubject.value;
        this.messagesSubject.next([...current, msg]);
      };

      this.socket.onclose = () => {
        this.statusSubject.next('disconnected');
      };

      this.socket.onerror = () => {
        // Fallback: use REST polling if WebSocket not available
        this.statusSubject.next('connected');
        this.startPolling(username);
      };
    } catch {
      this.statusSubject.next('connected');
      this.startPolling(username);
    }
  }

  private pollingInterval: any;

  private startPolling(username: string) {
    // Poll every 3 seconds as WebSocket fallback
    this.pollingInterval = setInterval(() => {
      this.loadHistory(username);
    }, 3000);
  }

  loadHistory(currentUser?: string) {
    this.http.get<ChatMessage[]>(`${this.apiUrl}/chat/messages/`).subscribe({
      next: msgs => {
        const annotated = msgs.map(m => ({ ...m, is_own: m.username === currentUser }));
        this.messagesSubject.next(annotated);
      },
      error: () => {
        // Backend not running - keep existing messages
      }
    });
  }

  sendMessage(message: string, username: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message, username }));
    } else {
      // REST fallback
      this.http.post<ChatMessage>(`${this.apiUrl}/chat/messages/`, { message }).subscribe({
        next: msg => {
          const current = this.messagesSubject.value;
          this.messagesSubject.next([...current, { ...msg, is_own: true }]);
        },
        error: () => {
          // Optimistic local message if server unreachable
          const current = this.messagesSubject.value;
          this.messagesSubject.next([...current, {
            id: Date.now(), username, message,
            timestamp: new Date().toISOString(), is_own: true
          }]);
        }
      });
    }
  }

  disconnect(): void {
    clearInterval(this.pollingInterval);
    this.socket?.close();
    this.socket = null;
    this.statusSubject.next('disconnected');
  }
}
