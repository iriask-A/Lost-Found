import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-left">
          <a class="nav-logo" routerLink="/items">
            <span class="logo-main">KBTU</span>
            <span class="logo-sub">Lost&nbsp;&amp;&nbsp;Found</span>
          </a>
          <div class="nav-rule"></div>
          <div class="nav-links">
            <a routerLink="/items" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Browse</a>
            @if (auth.isLoggedIn) {
              <a routerLink="/report" routerLinkActive="active">Report</a>
              <a routerLink="/chat" routerLinkActive="active">Chat</a>
              <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            }
          </div>
        </div>
        <div class="nav-right">
          @if (auth.isLoggedIn) {
            <span class="user-chip"><span class="user-dot"></span>{{ auth.currentUser?.username }}</span>
            <button class="btn-nav" (click)="auth.logout()">Sign out</button>
          } @else {
            <a routerLink="/login" class="btn-nav accent">Sign in</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav { background: var(--espresso); border-bottom: 1px solid rgba(240,234,216,0.08); position: sticky; top: 0; z-index: 200; }
    .nav-inner { max-width: 1260px; margin: 0 auto; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; height: 56px; }
    .nav-left { display: flex; align-items: center; gap: 20px; }
    .nav-logo { display: flex; flex-direction: column; line-height: 1; gap: 1px; cursor: pointer; }
    .logo-main { font-family: var(--font-display); font-size: 15px; font-weight: 900; color: var(--cream); letter-spacing: 0.06em; }
    .logo-sub { font-family: var(--font-mono); font-size: 9px; color: var(--cork); letter-spacing: 0.1em; text-transform: uppercase; }
    .nav-rule { width: 1px; height: 24px; background: rgba(240,234,216,0.12); }
    .nav-links { display: flex; gap: 2px; }
    .nav-links a { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(240,234,216,0.45); padding: 5px 12px; border-radius: 2px; transition: color 0.15s, background 0.15s; }
    .nav-links a:hover { color: var(--cream); background: rgba(240,234,216,0.06); }
    .nav-links a.active { color: var(--cork); }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .user-chip { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px; color: rgba(240,234,216,0.4); }
    .user-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green2); }
    .btn-nav { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(240,234,216,0.45); background: none; border: 1px solid rgba(240,234,216,0.12); padding: 5px 14px; border-radius: 2px; cursor: pointer; transition: all 0.15s; }
    .btn-nav:hover { color: var(--cream); border-color: rgba(240,234,216,0.35); }
    .btn-nav.accent { color: var(--cork); border-color: rgba(184,154,110,0.35); }
    .btn-nav.accent:hover { background: rgba(184,154,110,0.1); color: var(--cream); }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
