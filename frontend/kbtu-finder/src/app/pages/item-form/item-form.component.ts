import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Category, Location } from '../../models/item.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css'],
  imports: [CommonModule, RouterModule,FormsModule],
})
export class ItemFormComponent implements OnInit {
  categories: Category[] = [];
  locations: Location[] = [];
  error = '';
  loading = false;
  isEdit = false;
  itemId?: number;
  selectedFile?: File;

  form = {
    title: '',
    description: '',
    status: 'found',
    category: '',
    location: '',
    date_occurred: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService
  ) {}

  ngOnInit() {
    this.itemService.getCategories().subscribe(d => this.categories = d);
    this.itemService.getLocations().subscribe(d => this.locations = d);

    this.itemId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.itemId) {
      this.isEdit = true;
      this.itemService.getItem(this.itemId).subscribe(item => {
        this.form.title = item.title;
        this.form.description = item.description;
        this.form.status = item.status;
        this.form.category = String(item.category);
        this.form.location = String(item.location);
        this.form.date_occurred = item.date_occurred || '';
      });
    }
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    this.loading = true;
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, v));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const call = this.isEdit
      ? this.itemService.updateItem(this.itemId!, fd as any)
      : this.itemService.createItem(fd);

    call.subscribe({
      next: (item) => this.router.navigate(['/items', item.id]),
      error: (err) => {
        this.error = JSON.stringify(err.error);
        this.loading = false;
      }
    });
  }
}
