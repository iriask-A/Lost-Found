import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item, ClaimRequest } from '../../models/item.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  myItems: Item[] = [];
  myClaims: ClaimRequest[] = [];
  loading = false;
  error = '';

  constructor(private itemService: ItemService, private router: Router) {}

  ngOnInit() {
    this.loadMyItems();
    this.loadMyClaims();
  }

  loadMyItems() {
    this.loading = true;
    this.itemService.getMyItems().subscribe({
      next: (data) => { this.myItems = data; this.loading = false; },
      error: () => { this.error = 'Failed to load your items.'; this.loading = false; }
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
