import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  private getErrorMessage(err: any): string {
    if (err?.status === 0) {
      return 'Cannot connect to backend. Start Django server on http://127.0.0.1:8000.';
    }
    if (err?.name === 'TimeoutError') {
      return 'Server did not respond. Check if backend is running on port 8000.';
    }
    return err?.error?.detail || 'Invalid credentials.';
  }

  // (click) event 1
  onLogin() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.username, this.password).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/items']);
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
      }
    });
  }
}
