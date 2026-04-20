import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-item-detail',
  standalone: true,
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
  imports: [CommonModule, RouterModule,FormsModule],
})
export class ItemDetailComponent implements OnInit {
  item!: Item;
  claimMessage = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.itemService.getItem(id).subscribe({
      next: (data) => this.item = data,
      error: () => this.error = 'Item not found.'
    });
  }

  onClaim() {
    if (!this.claimMessage.trim()) {
      this.error = 'Please write a message explaining why this item is yours.';
      return;
    }
    this.itemService.createClaim({ item: this.item.id, message: this.claimMessage }).subscribe({
      next: () => { this.success = 'Claim submitted successfully!'; this.claimMessage = ''; },
      error: () => this.error = 'Failed to submit claim.'
    });
  }

  onDelete() {
    if (!confirm('Delete this item?')) return;
    this.itemService.deleteItem(this.item.id).subscribe({
      next: () => this.router.navigate(['/items']),
      error: () => this.error = 'Failed to delete.'
    });
  }

  onMarkClaimed() {
    this.error = '';
    this.success = '';
    this.itemService.markClaimed(this.item.id).subscribe({
      next: (res) => {
        this.item.is_claimed = true;
        this.success = res.message;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to mark item as claimed.';
      }
    });
  }
}
