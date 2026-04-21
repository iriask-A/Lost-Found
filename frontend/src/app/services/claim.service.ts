import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClaimRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  submitClaim(itemId: number, message: string): Observable<ClaimRequest> {
    return this.http.post<ClaimRequest>(`${this.apiUrl}/items/${itemId}/claim/`, { message, item_id: itemId });
  }

  getMyClaims(): Observable<ClaimRequest[]> {
    return this.http.get<ClaimRequest[]>(`${this.apiUrl}/claims/`);
  }

  withdrawClaim(claimId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/claims/${claimId}/`);
  }

  getItemClaims(itemId: number): Observable<ClaimRequest[]> {
    return this.http.get<ClaimRequest[]>(`${this.apiUrl}/items/${itemId}/claims/`);
  }

  resolveClaim(claimId: number, action: 'approved' | 'rejected'): Observable<any> {
    return this.http.post(`${this.apiUrl}/claims/${claimId}/resolve/`, { action });
  }
}
