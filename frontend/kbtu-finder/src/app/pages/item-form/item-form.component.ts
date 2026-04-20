import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Category, Location } from '../../models/item.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-item-form',
  standalone: true,
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

  private getErrorMessage(err: any): string {
    if (typeof err?.error === 'string') return err.error;
    if (err?.error?.title?.length) return err.error.title[0];
    if (err?.error?.description?.length) return err.error.description[0];
    if (err?.error?.category?.length) return err.error.category[0];
    if (err?.error?.location?.length) return err.error.location[0];
    if (err?.error?.date_occurred?.length) return err.error.date_occurred[0];
    return 'Failed to save item. Please check the form fields.';
  }

  ngOnInit() {
    this.itemService.bootstrapReferenceData().subscribe({
      next: () => {
        this.itemService.getCategories().subscribe(d => this.categories = d);
        this.itemService.getLocations().subscribe(d => this.locations = d);
      },
      error: () => {
        // Fallback: still try loading existing reference data.
        this.itemService.getCategories().subscribe(d => this.categories = d);
        this.itemService.getLocations().subscribe(d => this.locations = d);
      }
    });

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
    this.error = '';
    if (!this.form.title.trim() || !this.form.description.trim()) {
      this.error = 'Title and description are required.';
      return;
    }
    if (!this.form.category || !this.form.location) {
      this.error = 'Please select both category and location.';
      return;
    }

    this.loading = true;
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, v));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const call = this.isEdit
      ? this.itemService.updateItem(this.itemId!, fd as any)
      : this.itemService.createItem(fd);

    call.pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = this.getErrorMessage(err);
      }
    });
  }
}
