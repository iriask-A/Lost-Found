import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

const STORAGE_KEY = 'kbtu_chat_messages';
const MAX_STORED = 200;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="chat-page">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-head">
          <div class="sh-label">Campus Chat</div>
          <h2 class="sh-title">General<br>Channel</h2>
        </div>
        <div class="sidebar-desc">
          Connect with fellow KBTU students. Ask about lost items, coordinate handovers, or just chat.
        </div>
        <div class="sidebar-rule"></div>
        <div class="channel active">
          <span class="ch-dot"></span>
          <div>
            <div class="ch-name">#general</div>
            <div class="ch-sub">Open to all students</div>
          </div>
        </div>
        <div class="channel" style="opacity:0.4;cursor:not-allowed">
          <span class="ch-dot" style="background:var(--warm)"></span>
          <div>
            <div class="ch-name">#lost-electronics</div>
            <div class="ch-sub">Coming soon</div>
          </div>
        </div>
        <div class="channel" style="opacity:0.4;cursor:not-allowed">
          <span class="ch-dot" style="background:var(--warm)"></span>
          <div>
            <div class="ch-name">#handover-board</div>
            <div class="ch-sub">Coming soon</div>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="you-chip">
            <div class="you-av">{{ username.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="you-name">{{ username }}</div>
              <div class="you-status">
                <span class="you-dot" [class.conn]="(chatSvc.status$ | async) === 'connected'"></span>
                {{ (chatSvc.status$ | async) }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main chat area -->
      <div class="chat-main">

        <div class="chat-topbar">
          <div class="tb-channel">#general</div>
          <div class="tb-count">{{ displayMessages.length }} messages</div>
        </div>

        <div class="messages" #msgContainer>
          @if (displayMessages.length === 0) {
            <div class="empty-chat">
              <div class="empty-glyph">◎</div>
              <p>No messages yet.<br>Say hello to start the conversation.</p>
            </div>
          }
          @for (msg of displayMessages; track msg.id) {
            <div class="msg-group" [class.own]="msg.is_own">

              @if (!msg.is_own) {
                <div class="msg-av">{{ msg.username.charAt(0).toUpperCase() }}</div>
              }

              <div class="msg-content">
                @if (!msg.is_own) {
                  <div class="msg-meta">
                    <span class="msg-user">{{ msg.username }}</span>
                    <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
                  </div>
                }
                <div class="msg-bubble">{{ msg.message }}</div>
                @if (msg.is_own) {
                  <div class="msg-meta own-meta">
                    <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
                  </div>
                }
              </div>

              @if (msg.is_own) {
                <div class="msg-av own-av">{{ msg.username.charAt(0).toUpperCase() }}</div>
              }

            </div>
          }
        </div>

        <div class="chat-input-row">
          <input
            class="chat-input"
            type="text"
            [(ngModel)]="message"
            name="msg"
            placeholder="Message #general…"
            (keydown.enter)="send()"
          >
          <button class="send-btn" (click)="send()" [disabled]="!message.trim()">
            <span>Send</span>
            <span class="send-arrow">↑</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      height: calc(100vh - 56px);
      display: grid; grid-template-columns: 260px 1fr;
      overflow: hidden;
    }
    .sidebar {
      background: var(--espresso);
      display: flex; flex-direction: column;
      padding: 28px 20px;
      border-right: 1px solid rgba(240,234,216,0.06);
      overflow-y: auto;
    }
    .sidebar-head { margin-bottom: 14px; }
    .sh-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cork); margin-bottom: 6px; }
    .sh-title { font-family: var(--font-display); font-size: 28px; font-weight: 900; color: var(--cream); line-height: 1; }
    .sidebar-desc { font-size: 12px; color: rgba(240,234,216,0.35); line-height: 1.6; margin-bottom: 20px; }
    .sidebar-rule { width: 100%; height: 1px; background: rgba(240,234,216,0.08); margin-bottom: 16px; }
    .channel { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 3px; cursor: pointer; transition: background 0.15s; margin-bottom: 2px; }
    .channel:hover { background: rgba(240,234,216,0.05); }
    .channel.active { background: rgba(184,154,110,0.12); }
    .ch-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green2); flex-shrink: 0; }
    .ch-name { font-family: var(--font-mono); font-size: 12px; color: var(--cream); }
    .channel.active .ch-name { color: var(--cork); }
    .ch-sub { font-family: var(--font-mono); font-size: 9px; color: rgba(240,234,216,0.25); margin-top: 1px; }
    .sidebar-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(240,234,216,0.06); }
    .you-chip { display: flex; align-items: center; gap: 10px; }
    .you-av { width: 30px; height: 30px; border-radius: 50%; background: var(--cork); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--espresso); flex-shrink: 0; }
    .you-name { font-size: 12px; color: var(--cream); font-weight: 500; }
    .you-status { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 9px; color: rgba(240,234,216,0.3); text-transform: capitalize; margin-top: 2px; }
    .you-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--warm); transition: background 0.3s; }
    .you-dot.conn { background: var(--green2); }
    .chat-main { display: flex; flex-direction: column; background: var(--cream); overflow: hidden; }
    .chat-topbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid var(--border); background: var(--sand); flex-shrink: 0; }
    .tb-channel { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--espresso); }
    .tb-count { font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
    .messages { flex: 1; overflow-y: auto; padding: 24px 24px 16px; display: flex; flex-direction: column; gap: 4px; scroll-behavior: smooth; }
    .empty-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--muted); font-size: 13px; line-height: 1.7; gap: 12px; }
    .empty-glyph { font-family: var(--font-display); font-size: 48px; color: var(--warm); }
    .msg-group { display: flex; align-items: flex-end; gap: 8px; max-width: 72%; animation: fadeUp 0.2s ease both; }
    .msg-group.own { align-self: flex-end; flex-direction: row-reverse; }
    .msg-group:not(.own) { align-self: flex-start; }
    .msg-av { width: 28px; height: 28px; border-radius: 50%; background: var(--espresso); color: var(--cream); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .msg-av.own-av { background: var(--cork); color: var(--espresso); }
    .msg-content { display: flex; flex-direction: column; gap: 3px; max-width: 100%; }
    .msg-meta { display: flex; gap: 8px; align-items: baseline; padding: 0 2px; }
    .msg-user { font-family: var(--font-mono); font-size: 10px; font-weight: 500; color: var(--cork); }
    .msg-time { font-family: var(--font-mono); font-size: 9px; color: var(--muted); }
    .own-meta { justify-content: flex-end; }
    .msg-bubble {
      background: var(--sand); border: 1px solid var(--border);
      padding: 9px 13px; border-radius: 4px 4px 4px 0;
      font-size: 13px; color: var(--ink); line-height: 1.5;
      max-width: 100%; word-break: break-word;
    }
    .msg-group.own .msg-bubble { background: var(--espresso); color: var(--cream); border-color: transparent; border-radius: 4px 4px 0 4px; }
    .chat-input-row { display: flex; gap: 0; padding: 16px 24px; border-top: 1px solid var(--border); background: var(--sand); flex-shrink: 0; }
    .chat-input { flex: 1; background: var(--cream); border: 1px solid var(--border); border-right: none; color: var(--ink); padding: 11px 16px; font-size: 13px; outline: none; border-radius: 3px 0 0 3px; transition: border-color 0.15s; }
    .chat-input:focus { border-color: var(--cork); }
    .chat-input::placeholder { color: var(--warm); }
    .send-btn { background: var(--espresso); color: var(--cream); border: 1px solid var(--espresso); padding: 11px 20px; border-radius: 0 3px 3px 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s; }
    .send-btn:hover:not(:disabled) { background: var(--brown); }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .send-arrow { font-size: 14px; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer!: ElementRef;
  message = '';
  username = '';

  // The component owns its display list — no touching service internals
  displayMessages: ChatMessage[] = [];

  private sub!: Subscription;
  private shouldScroll = false;

  constructor(public chatSvc: ChatService, private auth: AuthService) {}

  ngOnInit() {
    this.username = this.auth.currentUser?.username || 'Anonymous';

    // Step 1: show cached history instantly, before WS even connects
    this.displayMessages = this.loadFromStorage();
    this.shouldScroll = true;

    // Step 2: open WebSocket
    this.chatSvc.connect(this.username);

    // Step 3: whenever the service emits live messages, merge with cache
    this.sub = this.chatSvc.messages$.subscribe(liveMessages => {
      if (liveMessages.length === 0) return; // service reset — keep our cache

      // Deduplicate: keep cached messages whose IDs aren't in the live stream,
      // then append the full live stream behind them
      const liveIds = new Set(liveMessages.map(m => m.id));
      const cachedOnly = this.displayMessages.filter(m => !liveIds.has(m.id));
      this.displayMessages = [...cachedOnly, ...liveMessages].slice(-MAX_STORED);

      this.saveToStorage(this.displayMessages);
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom() {
    try {
      const el = this.msgContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  send() {
    const msg = this.message.trim();
    if (!msg) return;
    this.message = '';
    this.chatSvc.sendMessage(msg, this.username);
  }

  ngOnDestroy() {
    this.chatSvc.disconnect();
    this.sub?.unsubscribe();
  }

  // ── localStorage helpers ─────────────────────────────────────────────────

  private loadFromStorage(): ChatMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const saved: ChatMessage[] = JSON.parse(raw);
      if (!Array.isArray(saved)) return [];
      // Re-flag is_own for whoever is currently logged in
      return saved.map(m => ({ ...m, is_own: m.username === this.username }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private saveToStorage(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      localStorage.removeItem(STORAGE_KEY); // quota exceeded — reset gracefully
    }
  }
}
