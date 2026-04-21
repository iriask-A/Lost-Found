export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  item_count: number;
}

export interface Location {
  id: number;
  name: string;
  building: string;
  floor: string;
  item_count: number;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  category: Category;
  location: Location;
  found_by: User;
  status: 'open' | 'claimed' | 'closed';
  date_found: string;
  image?: string;
  claim_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClaimRequest {
  id: number;
  item: Item;
  claimed_by: User;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface ItemFilters {
  search?: string;
  location?: string;
  category?: string;
  status?: string;
}
