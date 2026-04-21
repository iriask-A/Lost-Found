import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemFilters } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getItems(filters?: ItemFilters): Observable<Item[]> {
    let params = new HttpParams();
    if (filters?.search)   params = params.set('search', filters.search);
    if (filters?.location) params = params.set('location', filters.location);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.status)   params = params.set('status', filters.status);
    return this.http.get<Item[]>(`${this.apiUrl}/items/`, { params });
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/${id}/`);
  }

  createItem(data: FormData): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items/create/`, data);
  }

  updateItem(id: number, data: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}/`, data);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}/`);
  }

  getMyItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items/mine/`);
  }

  searchItems(query: string): Observable<{ results: Item[]; count: number }> {
    return this.http.get<{ results: Item[]; count: number }>(
      `${this.apiUrl}/items/search/`, { params: { q: query } }
    );
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/`);
  }

  getLocations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/locations/`);
  }
}
