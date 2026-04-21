import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-report-item',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="page">

      <div class="page-head">
        <div class="ph-label">Found something?</div>
        <h1 class="ph-title">Report<br><em>a found item</em></h1>
        <p class="ph-copy">Help someone reunite with their belongings. Fill in as much detail as you can.</p>
      </div>

      @if (err) { <div class="msg error">{{ err }}</div> }
      @if (ok)  { <div class="msg success">{{ ok }}</div> }

      <div class="form-layout">
        <form (ngSubmit)="submit()">

          <div class="section-label">— Basic info</div>
          <div class="fg-row">
            <div class="fg">
              <label>Item name *</label>
              <input type="text" [(ngModel)]="f.name" name="name" placeholder="e.g. Black laptop bag">
            </div>
            <div class="fg">
              <label>Category *</label>
              <select [(ngModel)]="f.category_id" name="cat">
                <option value="">Select…</option>
                @for (c of cats; track c.id) { <option [value]="c.id">{{ c.name }}</option> }
              </select>
            </div>
          </div>

          <div class="section-label">— Where &amp; when</div>
          <div class="fg-row">
            <div class="fg">
              <label>Location found *</label>
              <select [(ngModel)]="f.location_id" name="loc">
                <option value="">Select location…</option>
                @for (l of locs; track l.id) { <option [value]="l.id">{{ l.name }}</option> }
              </select>
            </div>
            <div class="fg">
              <label>Date found *</label>
              <input type="date" [(ngModel)]="f.date_found" name="date">
            </div>
          </div>

          <div class="section-label">— Description</div>
          <div class="fg">
            <label>Describe the item *</label>
            <textarea [(ngModel)]="f.description" name="desc" rows="4" placeholder="Colour, brand, distinguishing marks, contents, condition…"></textarea>
          </div>

          <div class="section-label">— Photo (optional)</div>
          <div class="fg">
            <label>Attach image</label>
            <input type="file" accept="image/*" (change)="onFile($event)" class="file-in" name="img">
            <p class="hint">A photo helps the owner identify their item faster.</p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="loading">
              {{ loading ? 'Submitting…' : 'Submit report →' }}
            </button>
            <button type="button" class="btn-clear" (click)="reset()">Clear</button>
          </div>

        </form>

        <aside class="form-aside">
          <div class="aside-block">
            <div class="aside-label">Tips for a good report</div>
            <ul class="aside-list">
              <li>Be specific about the location — floor, room, landmark.</li>
              <li>Describe unique features: brand, colour, stickers, damage.</li>
              <li>Include what's inside if the item was open (e.g. wallet contents).</li>
              <li>Attach a photo whenever possible.</li>
            </ul>
          </div>
          <div class="aside-block">
            <div class="aside-label">What happens next?</div>
            <div class="aside-step"><span>01</span> Your report goes live immediately.</div>
            <div class="aside-step"><span>02</span> The owner can submit a claim.</div>
            <div class="aside-step"><span>03</span> You approve or reject the claim.</div>
            <div class="aside-step"><span>04</span> Arrange handover &amp; mark as returned.</div>
          </div>
        </aside>
      </div>

    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 48px 28px 80px; }
    .page-head { border-bottom: 1px solid var(--border); padding-bottom: 36px; margin-bottom: 36px; }
    .ph-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cork); margin-bottom: 10px; }
    .ph-title { font-family: var(--font-display); font-size: 56px; font-weight: 900; line-height: 0.95; color: var(--ink); letter-spacing: -1.5px; margin-bottom: 14px; }
    .ph-title em { color: var(--cork); font-style: italic; }
    .ph-copy { font-size: 14px; color: var(--muted); max-width: 400px; line-height: 1.6; }
    .msg { padding: 12px 16px; border-radius: 3px; font-size: 13px; margin-bottom: 20px; }
    .error  { background: rgba(196,88,30,0.08); border: 1px solid rgba(196,88,30,0.2); color: var(--rust); }
    .success{ background: rgba(45,74,53,0.08);  border: 1px solid rgba(45,74,53,0.2);  color: var(--green); }
    .form-layout { display: grid; grid-template-columns: 1fr 300px; gap: 48px; align-items: start; }
    .section-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cork); margin: 24px 0 14px; border-top: 1px solid var(--border2); padding-top: 18px; }
    .fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .fg { margin-bottom: 14px; }
    .fg label { display: block; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .fg input, .fg select, .fg textarea { width: 100%; background: var(--sand); border: 1px solid var(--border); color: var(--ink); padding: 9px 12px; border-radius: 3px; font-size: 13px; outline: none; transition: border-color 0.15s; resize: vertical; }
    .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: var(--cork); }
    .fg input::placeholder, .fg textarea::placeholder { color: var(--warm); }
    .file-in { padding: 8px; cursor: pointer; }
    .hint { font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-top: 6px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .btn-submit { background: var(--espresso); color: var(--cream); border: none; padding: 12px 28px; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.15s; }
    .btn-submit:hover:not(:disabled) { background: var(--brown); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-clear { background: none; color: var(--muted); border: 1px solid var(--border); padding: 12px 20px; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; transition: all 0.15s; }
    .btn-clear:hover { border-color: var(--brown); color: var(--brown); }
    /* Aside */
    .form-aside { position: sticky; top: 80px; }
    .aside-block { background: var(--sand); border: 1px solid var(--border); border-radius: 3px; padding: 20px; margin-bottom: 14px; }
    .aside-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cork); margin-bottom: 14px; }
    .aside-list { padding-left: 16px; font-size: 12px; color: var(--brown); line-height: 1.8; }
    .aside-step { display: flex; gap: 12px; font-size: 12px; color: var(--brown); margin-bottom: 8px; line-height: 1.4; }
    .aside-step span { font-family: var(--font-mono); font-size: 10px; color: var(--cork); flex-shrink: 0; padding-top: 1px; }
  `]
})
export class ReportItemComponent implements OnInit {
  cats: any[] = []; locs: any[] = [];
  loading = false; err = ''; ok = '';
  file: File | null = null;
  f = { name: '', description: '', category_id: '', location_id: '', date_found: new Date().toISOString().split('T')[0] };

  constructor(private itemSvc: ItemService, private router: Router) {}

  ngOnInit() {
    this.itemSvc.getCategories().subscribe(d => this.cats = d);
    this.itemSvc.getLocations().subscribe(d => this.locs = d);
  }

  onFile(e: Event) { const i = e.target as HTMLInputElement; if (i.files?.length) this.file = i.files[0]; }

  submit() {
    this.err = '';
    if (!this.f.name || !this.f.category_id || !this.f.location_id || !this.f.description || !this.f.date_found) { this.err = 'Please fill in all required fields.'; return; }
    const fd = new FormData();
    Object.entries(this.f).forEach(([k, v]) => fd.append(k, v));
    if (this.file) fd.append('image', this.file);
    this.loading = true;
    this.itemSvc.createItem(fd).subscribe({
      next: item => { this.ok = `"${item.name}" reported! Redirecting…`; this.loading = false; this.reset(); setTimeout(() => this.router.navigate(['/items', item.id]), 1800); },
      error: e => { this.err = e.error?.name?.[0] || e.error?.description?.[0] || 'Submit failed.'; this.loading = false; }
    });
  }

  reset() { this.f = { name: '', description: '', category_id: '', location_id: '', date_found: new Date().toISOString().split('T')[0] }; this.file = null; }
}
