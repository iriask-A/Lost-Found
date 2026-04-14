import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-register',
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

  // (click) event 2
  onRegister() {
    this.error = '';
    if (this.password !== this.password2) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password,
      password2: this.password2
    }).subscribe({
      next: () => this.router.navigate(['/items']),
      error: (err) => {
        this.error = JSON.stringify(err.error);
        this.loading = false;
      }
    });
  }
}
