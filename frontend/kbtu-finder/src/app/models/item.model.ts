export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Location {
  id: number;
  name: string;
  building?: string;
  floor?: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  status: 'lost' | 'found';
  category: number;
  category_name?: string;
  location: number;
  location_name?: string;
  posted_by?: number;
  posted_by_username?: string;
  image?: string;
  is_claimed: boolean;
  date_posted?: string;
  date_occurred?: string;
}

export interface ClaimRequest {
  id?: number;
  item: number;
  item_title?: string;
  message: string;
  status?: string;
  created_at?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}
