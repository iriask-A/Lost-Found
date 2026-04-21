import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  get accessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, { username, password }).pipe(
      tap(res => this.storeTokens(res))
    );
  }

  register(data: { username: string; email: string; password: string; first_name?: string; last_name?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, data).pipe(
      tap(res => this.storeTokens(res))
    );
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${this.apiUrl}/logout/`, { refresh }).subscribe();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private storeTokens(res: AuthResponse): void {
    localStorage.setItem('access_token', res.access);
    localStorage.setItem('refresh_token', res.refresh);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }
}
