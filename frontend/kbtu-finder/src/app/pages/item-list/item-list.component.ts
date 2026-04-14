import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item, Category, Location } from '../../models/item.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
  imports: [CommonModule, RouterModule,FormsModule],
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  categories: Category[] = [];
  locations: Location[] = [];
  loading = false;
  error = '';

  // filter form fields
  searchQuery = '';
  selectedCategory = '';
  selectedLocation = '';
  selectedStatus = '';

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadLocations();
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.error = 'Failed to load items.'; this.loading = false; }
    });
  }

  loadCategories() {
    this.itemService.getCategories().subscribe(data => this.categories = data);
  }

  loadLocations() {
    this.itemService.getLocations().subscribe(data => this.locations = data);
  }

  // (click) event 3 — Search
  onSearch() {
    this.loading = true;
    this.itemService.searchItems({
      query: this.searchQuery,
      category: this.selectedCategory,
      location: this.selectedLocation,
      status: this.selectedStatus
    }).subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.error = 'Search failed.'; this.loading = false; }
    });
  }

  // (click) event 4 — Clear filters
  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.selectedStatus = '';
    this.loadItems();
  }
}
