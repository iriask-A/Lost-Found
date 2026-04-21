import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="login-page">

      <div class="login-left">
        <div class="left-label">KBTU Campus</div>
        <h1 class="left-headline">The campus<br><em>Lost &amp; Found</em><br>portal.</h1>
        <p class="left-copy">Report items you've found. Reclaim what's yours. Connect with fellow students — all in one place.</p>
        <div class="left-rule"></div>
        <div class="left-stat"><span class="stat-n">01</span><span class="stat-t">Secure JWT Auth</span></div>
        <div class="left-stat"><span class="stat-n">02</span><span class="stat-t">Real-time Campus Chat</span></div>
        <div class="left-stat"><span class="stat-n">03</span><span class="stat-t">Location-based Search</span></div>
      </div>

      <div class="login-right">
        <div class="form-card">
          <div class="tab-row">
            <button class="tab" [class.active]="mode==='login'" (click)="mode='login'; clearMsgs()">Sign In</button>
            <button class="tab" [class.active]="mode==='register'" (click)="mode='register'; clearMsgs()">Register</button>
          </div>

          @if (errorMsg) { <div class="msg error">{{ errorMsg }}</div> }
          @if (successMsg) { <div class="msg success">{{ successMsg }}</div> }

          @if (mode === 'login') {
            <form (ngSubmit)="onLogin()">
              <div class="fg">
                <label>Username</label>
                <input type="text" [(ngModel)]="loginData.username" name="username" placeholder="your_username">
              </div>
              <div class="fg">
                <label>Password</label>
                <input type="password" [(ngModel)]="loginData.password" name="password" placeholder="••••••••">
              </div>
              <button type="submit" class="btn-submit" [disabled]="loading">
                {{ loading ? 'Signing in...' : 'Sign In →' }}
              </button>
            </form>
          }

          @if (mode === 'register') {
            <form (ngSubmit)="onRegister()">
              <div class="fg-row">
                <div class="fg">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="regData.first_name" name="fn" placeholder="Name">
                </div>
                <div class="fg">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="regData.last_name" name="ln" placeholder="Surname">
                </div>
              </div>
              <div class="fg">
                <label>Username</label>
                <input type="text" [(ngModel)]="regData.username" name="username" placeholder="username">
              </div>
              <div class="fg">
                <label>KBTU Email</label>
                <div class="email-input-wrapper">
                  <input
                    type="text"
                    [(ngModel)]="emailPrefix"
                    name="emailPrefix"
                    placeholder="someone"
                    (ngModelChange)="syncEmail()"
                    [class.invalid]="emailPrefix && !isEmailValid()"
                  >
                  <span class="email-suffix">&#64;kbtu.kz</span>
                </div>
                @if (emailPrefix && !isEmailValid()) {
                  <span class="field-hint error-hint">Only letters, numbers, dots, underscores and hyphens allowed.</span>
                }
              </div>
              <div class="fg">
                <label>Password</label>
                <input type="password" [(ngModel)]="regData.password" name="password" placeholder="Min. 6 characters">
              </div>
              <button type="submit" class="btn-submit" [disabled]="loading">
                {{ loading ? 'Creating...' : 'Create Account →' }}
              </button>
            </form>
          }

          <p class="demo-hint">Demo: <code>student1</code> / <code>pass1234</code></p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 56px);
      display: grid; grid-template-columns: 1fr 1fr;
      background: var(--cream);
    }
    .login-left {
      background: var(--espresso);
      padding: 64px 56px;
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }
    .login-left::before {
      content: 'L&F';
      position: absolute; bottom: -20px; right: -10px;
      font-family: var(--font-display); font-size: 180px; font-weight: 900;
      color: rgba(240,234,216,0.03); line-height: 1; pointer-events: none;
    }
    .left-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cork); margin-bottom: 28px; }
    .left-headline { font-family: var(--font-display); font-size: 52px; font-weight: 900; color: var(--cream); line-height: 1.1; margin-bottom: 20px; }
    .left-headline em { color: var(--cork); font-style: italic; }
    .left-copy { font-size: 14px; color: rgba(240,234,216,0.5); line-height: 1.7; margin-bottom: 32px; max-width: 360px; }
    .left-rule { width: 40px; height: 1px; background: rgba(240,234,216,0.15); margin-bottom: 24px; }
    .left-stat { display: flex; align-items: baseline; gap: 14px; margin-bottom: 10px; }
    .stat-n { font-family: var(--font-mono); font-size: 10px; color: var(--cork); }
    .stat-t { font-size: 13px; color: rgba(240,234,216,0.45); }
    .login-right {
      display: flex; align-items: center; justify-content: center;
      padding: 40px 56px;
      background: var(--sand);
    }
    .form-card { width: 100%; max-width: 380px; }
    .tab-row { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 28px; }
    .tab { flex: 1; padding: 10px 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; }
    .tab.active { color: var(--espresso); border-bottom-color: var(--espresso); }
    .fg { margin-bottom: 16px; }
    .fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .fg label { display: block; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .fg input { width: 100%; background: var(--cream); border: 1px solid var(--border); color: var(--ink); padding: 9px 12px; border-radius: 3px; font-size: 13px; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
    .fg input:focus { border-color: var(--cork); }
    .fg input::placeholder { color: var(--warm); }

    /* Split email input */
    .email-input-wrapper { display: flex; align-items: stretch; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; background: var(--cream); transition: border-color 0.15s; }
    .email-input-wrapper:focus-within { border-color: var(--cork); }
    .email-input-wrapper input { border: none; border-radius: 0; flex: 1; min-width: 0; background: transparent; }
    .email-input-wrapper input.invalid { color: var(--rust); }
    .email-suffix { display: flex; align-items: center; padding: 0 10px; font-family: var(--font-mono); font-size: 11px; color: var(--muted); background: rgba(0,0,0,0.04); border-left: 1px solid var(--border); white-space: nowrap; user-select: none; }
    .field-hint { display: block; font-family: var(--font-mono); font-size: 9px; margin-top: 5px; }
    .error-hint { color: var(--rust); }

    .btn-submit { width: 100%; margin-top: 8px; padding: 12px; background: var(--espresso); color: var(--cream); border: none; border-radius: 3px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.15s; }
    .btn-submit:hover:not(:disabled) { background: var(--brown); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .msg { padding: 10px 14px; border-radius: 3px; font-size: 13px; margin-bottom: 16px; }
    .error { background: rgba(196,88,30,0.08); border: 1px solid rgba(196,88,30,0.25); color: var(--rust); }
    .success { background: rgba(45,74,53,0.08); border: 1px solid rgba(45,74,53,0.25); color: var(--green); }
    .demo-hint { margin-top: 16px; font-family: var(--font-mono); font-size: 10px; color: var(--muted); text-align: center; }
    .demo-hint code { color: var(--brown); }
  `]
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  loading = false;
  errorMsg = ''; successMsg = '';
  loginData = { username: '', password: '' };
  regData = { username: '', email: '', password: '', first_name: '', last_name: '' };

  /** Holds only the part before @kbtu.kz */
  emailPrefix = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn) this.router.navigate(['/items']);
  }

  clearMsgs() { this.errorMsg = ''; this.successMsg = ''; }

  /** Syncs the full email into regData whenever the prefix changes */
  syncEmail() {
    this.regData.email = this.emailPrefix ? `${this.emailPrefix}@kbtu.kz` : '';
  }

  /** Prefix must contain only safe email-local characters */
  isEmailValid(): boolean {
    return /^[a-zA-Z0-9._%+\-]+$/.test(this.emailPrefix);
  }

  onLogin() {
    this.clearMsgs();
    if (!this.loginData.username || !this.loginData.password) { this.errorMsg = 'Please fill in all fields.'; return; }
    this.loading = true;
    this.auth.login(this.loginData.username, this.loginData.password).subscribe({
      next: () => this.router.navigate(['/items']),
      error: (err) => { this.errorMsg = err.error?.error || 'Invalid credentials.'; this.loading = false; }
    });
  }

  onRegister() {
    this.clearMsgs();
    if (!this.regData.username || !this.regData.email || !this.regData.password) { this.errorMsg = 'Fill in all required fields.'; return; }
    if (!this.emailPrefix || !this.isEmailValid()) { this.errorMsg = 'Please enter a valid @kbtu.kz email address.'; return; }
    this.loading = true;
    this.auth.register(this.regData).subscribe({
      next: () => this.router.navigate(['/items']),
      error: (err) => {
        const e = err.error;
        this.errorMsg = e?.username?.[0] || e?.email?.[0] || e?.password?.[0] || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}
