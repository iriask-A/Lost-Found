import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/auth/register/`, data).pipe(
      timeout(10000),
      tap((res: any) => this.saveTokens(res))
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/auth/login/`, { username, password }).pipe(
      timeout(10000),
      tap((res: any) => this.saveTokens(res))
    );
  }

  logout(): Observable<any> {
    const refresh = localStorage.getItem('refresh');
    return this.http.post(`${this.API}/auth/logout/`, { refresh }).pipe(
      timeout(10000),
      tap(() => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); })
    );
  }

  private saveTokens(res: any) {
  if (res && res.access && res.refresh) {
    localStorage.setItem('access', res.access);
    localStorage.setItem('refresh', res.refresh);
  }
}

  getToken(): string | null {
    return localStorage.getItem('access');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Number(payload.user_id) || null;
    } catch {
      return null;
    }
  }
}
