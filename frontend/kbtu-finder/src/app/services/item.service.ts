import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Item, Category, Location, ClaimRequest } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Items CRUD
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.API}/items/`).pipe(timeout(10000));
  }

  getMyItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.API}/items/mine/`).pipe(timeout(10000));
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.API}/items/${id}/`);
  }

  createItem(data: FormData): Observable<Item> {
    return this.http.post<Item>(`${this.API}/items/`, data);
  }

  updateItem(id: number, data: any): Observable<Item> {
    return this.http.put<Item>(`${this.API}/items/${id}/`, data);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/items/${id}/`);
  }

  markClaimed(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/items/${id}/mark-claimed/`, {});
  }

  searchItems(filters: any): Observable<Item[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => {
      if (filters[k]) params = params.set(k, filters[k]);
    });
    return this.http.get<Item[]>(`${this.API}/items/search/`, { params }).pipe(timeout(10000));
  }

  // Supporting data
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API}/categories/`).pipe(timeout(10000));
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.API}/locations/`).pipe(timeout(10000));
  }

  bootstrapReferenceData(): Observable<any> {
    return this.http.post(`${this.API}/bootstrap-reference-data/`, {});
  }

  // Claims
  createClaim(data: Partial<ClaimRequest>): Observable<ClaimRequest> {
    return this.http.post<ClaimRequest>(`${this.API}/claims/`, data);
  }

  getMyClaims(): Observable<ClaimRequest[]> {
    return this.http.get<ClaimRequest[]>(`${this.API}/claims/`);
  }
}
