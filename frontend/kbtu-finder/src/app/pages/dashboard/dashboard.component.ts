import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item, ClaimRequest } from '../../models/item.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  myItems: Item[] = [];
  myClaims: ClaimRequest[] = [];
  loading = false;
  error = '';

  constructor(
    private itemService: ItemService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadMyItems();
    this.loadMyClaims();
  }

  loadMyItems() {
    this.loading = true;
    this.error = '';
    this.itemService.getMyItems().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.myItems = data;
          this.loading = false;
          return;
        }

        // Fallback path: filter from all items by current user id.
        const currentUserId = this.auth.getCurrentUserId();
        if (!currentUserId) {
          this.myItems = [];
          this.loading = false;
          return;
        }

        this.itemService.getItems().subscribe({
          next: (allItems) => {
            this.myItems = allItems.filter(item => item.posted_by === currentUserId);
            this.loading = false;
          },
          error: () => {
            this.error = 'Could not resolve your items right now.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to load your items. Please login again.';
        this.loading = false;
      }
    });
  }

  loadMyClaims() {
    this.itemService.getMyClaims().subscribe({
      next: (data) => this.myClaims = data,
      error: () => {}
    });
  }

  deleteItem(id: number) {
    if (!confirm('Delete this item?')) return;
    this.itemService.deleteItem(id).subscribe(() => this.loadMyItems());
  }
}
