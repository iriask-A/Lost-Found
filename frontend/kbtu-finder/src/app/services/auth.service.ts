import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/register/`, data).pipe(
      tap((res: any) => this.saveTokens(res))
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/login/`, { username, password }).pipe(
      tap((res: any) => this.saveTokens(res))
    );
  }

  logout(): Observable<any> {
    const refresh = localStorage.getItem('refresh');
    return this.http.post(`${this.API}/logout/`, { refresh }).pipe(
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
}
