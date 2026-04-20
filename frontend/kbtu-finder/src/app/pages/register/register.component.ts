import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [CommonModule, RouterModule,FormsModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  password2 = '';
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
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.detail) return err.error.detail;
    if (err?.error?.non_field_errors?.length) return err.error.non_field_errors[0];
    if (err?.error?.username?.length) return err.error.username[0];
    if (err?.error?.email?.length) return err.error.email[0];
    if (err?.error?.password?.length) return err.error.password[0];
    return 'Registration failed. Please try again.';
  }

  // (click) event 2
  onRegister() {
    this.error = '';
    if (this.password !== this.password2) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    this.loading = true;
    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password,
      password2: this.password2
    }).pipe(
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
