import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/models';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">

      <!-- Hero header -->
      <div class="hero">
        <div class="hero-tag">Campus Board</div>
        <h1 class="hero-title">Lost<br><em>&amp; Found</em></h1>
        <p class="hero-copy">Items found around KBTU campus. If something's yours — claim it.</p>
        <div class="hero-stats">
          <div class="hstat"><span class="hstat-n">{{ items.length }}</span><span class="hstat-l">Total</span></div>
          <div class="hstat-div"></div>
          <div class="hstat"><span class="hstat-n accent">{{ countBy('open') }}</span><span class="hstat-l">Open</span></div>
          <div class="hstat-div"></div>
          <div class="hstat"><span class="hstat-n green">{{ countBy('claimed') }}</span><span class="hstat-l">Claimed</span></div>
        </div>
      </div>

      <!-- Filters bar -->
      <div class="filters">
        <input class="f-search" type="text" placeholder="Search items, descriptions..." [(ngModel)]="q" (ngModelChange)="onSearch()" name="q">
        <select class="f-sel" [(ngModel)]="fLoc" (ngModelChange)="load()" name="fLoc">
          <option value="">All locations</option>
          @for (l of locations; track l.id) { <option [value]="l.name">{{ l.name }}</option> }
        </select>
        <select class="f-sel" [(ngModel)]="fCat" (ngModelChange)="load()" name="fCat">
          <option value="">All categories</option>
          @for (c of categories; track c.id) { <option [value]="c.name">{{ c.name }}</option> }
        </select>
        <select class="f-sel" [(ngModel)]="fStat" (ngModelChange)="load()" name="fStat">
          <option value="">All status</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="closed">Returned</option>
        </select>
        @if (q || fLoc || fCat || fStat) {
          <button class="f-clear" (click)="clear()">✕ Clear</button>
        }
      </div>

      @if (errorMsg) { <div class="err-msg">{{ errorMsg }}</div> }
      @if (loading) { <div class="loading-row"><span class="loading-dot"></span>Loading...</div> }

      @if (!loading && items.length === 0) {
        <div class="empty">
          <div class="empty-glyph">○</div>
          <p class="empty-title">Nothing here</p>
          <p class="empty-sub">Try different filters or check back later.</p>
        </div>
      }

      @if (!loading && items.length > 0) {
        <div class="grid">
          @for (item of items; track item.id; let i = $index) {
            <a class="card" [routerLink]="['/items', item.id]" [style.animation-delay]="(i * 0.04) + 's'">
              <div class="card-thumb">
                <span class="card-icon">{{ icon(item.category?.name) }}</span>
                <span class="card-status" [class]="'s-' + item.status">{{ item.status }}</span>
              </div>
              <div class="card-body">
                <div class="card-cat">{{ item.category?.name }}</div>
                <div class="card-name">{{ item.name }}</div>
                <div class="card-meta">
                  <span>📍 {{ item.location?.name }}</span>
                  <span>{{ item.date_found }}</span>
                </div>
                <div class="card-desc">{{ item.description | slice:0:80 }}{{ (item.description?.length || 0) > 80 ? '…' : '' }}</div>
              </div>
              <div class="card-arrow">→</div>
            </a>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; padding: 48px 28px 64px; }

    /* Hero */
    .hero { margin-bottom: 48px; display: grid; grid-template-columns: auto 1fr auto; align-items: start; gap: 24px; border-bottom: 1px solid var(--border); padding-bottom: 40px; }
    .hero-tag { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cork); padding-top: 6px; }
    .hero-title { font-family: var(--font-display); font-size: 72px; font-weight: 900; line-height: 0.9; color: var(--ink); letter-spacing: -2px; }
    .hero-title em { color: var(--cork); font-style: italic; }
    .hero-copy { font-size: 14px; color: var(--muted); max-width: 220px; line-height: 1.6; padding-top: 8px; align-self: center; }
    .hero-stats { display: flex; align-items: center; gap: 16px; align-self: end; padding-bottom: 4px; }
    .hstat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .hstat-n { font-family: var(--font-display); font-size: 32px; font-weight: 900; color: var(--espresso); line-height: 1; }
    .hstat-n.accent { color: var(--rust); }
    .hstat-n.green { color: var(--green); }
    .hstat-l { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
    .hstat-div { width: 1px; height: 32px; background: var(--border); }

    /* Filters */
    .filters { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; align-items: center; }
    .f-search { flex: 1; min-width: 200px; background: var(--sand); border: 1px solid var(--border); color: var(--ink); padding: 8px 14px; border-radius: 3px; font-size: 13px; outline: none; transition: border-color 0.15s; }
    .f-search:focus { border-color: var(--cork); }
    .f-search::placeholder { color: var(--warm); }
    .f-sel { background: var(--sand); border: 1px solid var(--border); color: var(--brown); padding: 8px 12px; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; outline: none; cursor: pointer; }
    .f-sel:focus { border-color: var(--cork); }
    .f-clear { background: none; border: 1px solid var(--border); color: var(--muted); padding: 8px 12px; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s; }
    .f-clear:hover { border-color: var(--rust); color: var(--rust); }

    .err-msg { background: rgba(196,88,30,0.08); border: 1px solid rgba(196,88,30,0.2); color: var(--rust); padding: 12px 16px; border-radius: 3px; font-size: 13px; margin-bottom: 20px; }
    .loading-row { display: flex; align-items: center; gap: 10px; color: var(--muted); font-family: var(--font-mono); font-size: 12px; padding: 40px 0; }
    .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cork); animation: pulse 1s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .empty { text-align: center; padding: 80px 0; }
    .empty-glyph { font-family: var(--font-display); font-size: 64px; color: var(--warm); margin-bottom: 12px; }
    .empty-title { font-family: var(--font-display); font-size: 22px; color: var(--brown); margin-bottom: 6px; }
    .empty-sub { font-size: 13px; color: var(--muted); }

    /* Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); }
    .card {
      background: var(--cream);
      padding: 0;
      display: flex; flex-direction: column;
      cursor: pointer; text-decoration: none; color: inherit;
      transition: background 0.15s;
      animation: fadeUp 0.35s ease both;
      position: relative;
    }
    .card:hover { background: var(--sand); }
    .card-thumb {
      height: 120px; background: var(--sand);
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; position: relative;
      border-bottom: 1px solid var(--border2);
    }
    .card:hover .card-thumb { background: var(--warm); }
    .card-status { position: absolute; top: 10px; right: 10px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; }
    .s-open { background: rgba(45,74,53,0.12); color: var(--green); border: 1px solid rgba(45,74,53,0.2); }
    .s-claimed { background: rgba(122,92,58,0.12); color: var(--brown); border: 1px solid rgba(122,92,58,0.2); }
    .s-closed { background: rgba(154,142,124,0.12); color: var(--muted); border: 1px solid rgba(154,142,124,0.2); }
    .card-body { padding: 16px 18px; flex: 1; }
    .card-cat { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cork); margin-bottom: 4px; }
    .card-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 6px; line-height: 1.2; }
    .card-meta { display: flex; gap: 14px; font-size: 11px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 8px; }
    .card-desc { font-size: 12px; color: var(--brown); line-height: 1.5; }
    .card-arrow { padding: 10px 18px; font-family: var(--font-mono); font-size: 14px; color: var(--warm); border-top: 1px solid var(--border2); text-align: right; transition: color 0.15s; }
    .card:hover .card-arrow { color: var(--rust); }
  `]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  categories: any[] = [];
  locations: any[] = [];
  loading = false;
  errorMsg = '';
  q = ''; fLoc = ''; fCat = ''; fStat = '';
  private _t: any;

  constructor(private itemService: ItemService) {}

  ngOnInit() { this.load(); this.loadFilters(); }

  load() {
    this.loading = true; this.errorMsg = '';
    this.itemService.getItems({ search: this.q, location: this.fLoc, category: this.fCat, status: this.fStat }).subscribe({
      next: d => { this.items = d; this.loading = false; },
      error: () => { this.errorMsg = 'Failed to load items. Is the backend running?'; this.loading = false; }
    });
  }

  loadFilters() {
    this.itemService.getCategories().subscribe(d => this.categories = d);
    this.itemService.getLocations().subscribe(d => this.locations = d);
  }

  onSearch() { clearTimeout(this._t); this._t = setTimeout(() => this.load(), 380); }
  clear() { this.q = ''; this.fLoc = ''; this.fCat = ''; this.fStat = ''; this.load(); }
  countBy(s: string) { return this.items.filter(i => i.status === s).length; }
  icon(cat?: string) {
    const m: Record<string, string> = { Electronics:'📱', Documents:'🪪', 'Personal Items':'🎒', 'Books & Notes':'📚', Clothing:'👕', Keys:'🔑', Other:'📦' };
    return m[cat || ''] || '📦';
  }
}
