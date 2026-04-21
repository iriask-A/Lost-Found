import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/models';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="detail-page">

      <div class="back" routerLink="/items">← Back to board</div>

      @if (loading) { <div class="loader">Loading…</div> }
      @if (errorMsg && !item) { <div class="err">{{ errorMsg }}</div> }

      @if (item && !loading) {
        <div class="layout">

          <!-- Left: big display -->
          <div class="display">
            <div class="display-thumb">
              <span class="big-icon">{{ icon(item.category?.name) }}</span>
            </div>
            <div class="display-meta">
              <span class="dmeta-item">Ref #{{ item.id }}</span>
              <span class="dmeta-sep">·</span>
              <span class="dmeta-item">{{ item.created_at | date:'mediumDate' }}</span>
            </div>
          </div>

          <!-- Right: info + action -->
          <div class="info">
            <div class="info-tag">{{ item.category?.name }}</div>
            <h1 class="info-title">{{ item.name }}</h1>
            <p class="info-desc">{{ item.description }}</p>

            <div class="props">
              <div class="prop">
                <span class="prop-k">Location</span>
                <span class="prop-v">{{ item.location?.name }}</span>
              </div>
              <div class="prop">
                <span class="prop-k">Date found</span>
                <span class="prop-v">{{ item.date_found }}</span>
              </div>
              <div class="prop">
                <span class="prop-k">Reported by</span>
                <span class="prop-v">{{ item.found_by?.username }}</span>
              </div>
              <div class="prop">
                <span class="prop-k">Status</span>
                <span class="prop-v">
                  <span class="badge" [class]="'b-' + item.status">{{ item.status }}</span>
                </span>
              </div>
              <div class="prop">
                <span class="prop-k">Claims</span>
                <span class="prop-v">{{ item.claim_count }}</span>
              </div>
            </div>

            @if (errorMsg) { <div class="err" style="margin-bottom:16px">{{ errorMsg }}</div> }

            @if (item.status === 'open') {
              @if (!auth.isLoggedIn) {
                <a routerLink="/login" class="btn-action">Sign in to claim →</a>
              } @else if (item.found_by?.id === auth.currentUser?.id) {
                <div class="notice">This is your reported item.</div>
              } @else {
                <button class="btn-action" (click)="showModal = true">Submit claim request →</button>
              }
            } @else {
              <div class="notice">This item is {{ item.status }} — no longer accepting claims.</div>
            }

            @if (item.found_by?.id === auth.currentUser?.id) {
              <button class="btn-del" (click)="del()">Delete report</button>
            }
          </div>
        </div>
      }

      <!-- Claim modal -->
      @if (showModal) {
        <div class="overlay" (click)="showModal=false">
          <div class="modal" (click)="$event.stopPropagation()">
            <button class="modal-close" (click)="showModal=false">✕</button>
            <div class="modal-label">Claim Request</div>
            <h2 class="modal-title">{{ item?.name }}</h2>
            @if (claimErr) { <div class="err" style="margin-bottom:14px">{{ claimErr }}</div> }
            @if (claimOk)  { <div class="ok"  style="margin-bottom:14px">{{ claimOk }}</div> }
            <div class="fg">
              <label>Describe why this item is yours</label>
              <textarea [(ngModel)]="claimMsg" name="cm" rows="4" placeholder="e.g. The bag has a red keyring attached, and my student ID is inside — ID number 220101."></textarea>
            </div>
            <button class="btn-action" (click)="claim()" [disabled]="claimLoading">
              {{ claimLoading ? 'Submitting…' : 'Submit →' }}
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .detail-page { max-width: 1100px; margin: 0 auto; padding: 40px 28px 80px; }
    .back { font-family: var(--font-mono); font-size: 11px; color: var(--muted); cursor: pointer; margin-bottom: 32px; display: inline-block; transition: color 0.15s; }
    .back:hover { color: var(--rust); }
    .loader { font-family: var(--font-mono); font-size: 12px; color: var(--muted); padding: 40px 0; }
    .err { background: rgba(196,88,30,0.08); border: 1px solid rgba(196,88,30,0.2); color: var(--rust); padding: 12px 16px; border-radius: 3px; font-size: 13px; }
    .ok  { background: rgba(45,74,53,0.08); border: 1px solid rgba(45,74,53,0.2); color: var(--green); padding: 12px 16px; border-radius: 3px; font-size: 13px; }
    .layout { display: grid; grid-template-columns: 340px 1fr; gap: 48px; align-items: start; }
    .display-thumb { height: 340px; background: var(--sand); border: 1px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 96px; }
    .display-meta { margin-top: 10px; display: flex; gap: 8px; align-items: center; }
    .dmeta-item { font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
    .dmeta-sep { color: var(--warm); }
    .info-tag { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cork); margin-bottom: 10px; }
    .info-title { font-family: var(--font-display); font-size: 42px; font-weight: 900; color: var(--ink); line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
    .info-desc { font-size: 14px; color: var(--brown); line-height: 1.7; margin-bottom: 28px; max-width: 480px; }
    .props { border-top: 1px solid var(--border); margin-bottom: 28px; }
    .prop { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border2); font-size: 13px; }
    .prop-k { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
    .prop-v { color: var(--ink); font-weight: 500; }
    .badge { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 2px; }
    .b-open { background: rgba(45,74,53,0.1); color: var(--green); border: 1px solid rgba(45,74,53,0.2); }
    .b-claimed { background: rgba(122,92,58,0.1); color: var(--brown); border: 1px solid rgba(122,92,58,0.2); }
    .b-closed { background: rgba(154,142,124,0.1); color: var(--muted); border: 1px solid var(--border); }
    .btn-action { display: block; width: 100%; padding: 13px 20px; background: var(--espresso); color: var(--cream); border: none; border-radius: 3px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.15s; text-align: center; }
    .btn-action:hover:not(:disabled) { background: var(--brown); }
    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
    .notice { padding: 12px 16px; background: var(--sand); border: 1px solid var(--border); border-radius: 3px; font-size: 13px; color: var(--brown); }
    .btn-del { margin-top: 12px; background: none; border: 1px solid rgba(196,88,30,0.25); color: var(--rust); padding: 9px 16px; border-radius: 3px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; transition: all 0.15s; }
    .btn-del:hover { background: rgba(196,88,30,0.08); }
    /* Modal */
    .overlay { position: fixed; inset: 0; background: rgba(30,20,16,0.6); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; backdrop-filter: blur(2px); }
    .modal { background: var(--cream); border: 1px solid var(--border); border-radius: 4px; padding: 32px; width: 100%; max-width: 460px; position: relative; }
    .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 16px; color: var(--muted); cursor: pointer; }
    .modal-close:hover { color: var(--ink); }
    .modal-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cork); margin-bottom: 6px; }
    .modal-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--ink); margin-bottom: 20px; }
    .fg { margin-bottom: 16px; }
    .fg label { display: block; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .fg textarea { width: 100%; background: var(--sand); border: 1px solid var(--border); color: var(--ink); padding: 10px 12px; border-radius: 3px; font-size: 13px; outline: none; resize: vertical; line-height: 1.6; }
    .fg textarea:focus { border-color: var(--cork); }
  `]
})
export class ItemDetailComponent implements OnInit {
  item: Item | null = null;
  loading = false; errorMsg = '';
  showModal = false; claimMsg = ''; claimLoading = false; claimErr = ''; claimOk = '';

  constructor(
    private route: ActivatedRoute, private router: Router,
    private itemSvc: ItemService, private claimSvc: ClaimService, public auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.itemSvc.getItem(id).subscribe({ next: d => { this.item = d; this.loading = false; }, error: () => { this.errorMsg = 'Item not found.'; this.loading = false; } });
  }

  claim() {
    if (!this.claimMsg.trim()) { this.claimErr = 'Please describe why this item is yours.'; return; }
    this.claimLoading = true; this.claimErr = '';
    this.claimSvc.submitClaim(this.item!.id, this.claimMsg).subscribe({
      next: () => { this.claimOk = 'Claim submitted! The finder will be notified.'; this.claimLoading = false; if (this.item) this.item.status = 'claimed'; setTimeout(() => { this.showModal = false; this.claimOk = ''; }, 2000); },
      error: (e) => { this.claimErr = e.error?.error || e.error?.non_field_errors?.[0] || 'Failed to submit.'; this.claimLoading = false; }
    });
  }

  del() {
    if (!confirm('Delete this report?')) return;
    this.itemSvc.deleteItem(this.item!.id).subscribe({ next: () => this.router.navigate(['/items']), error: () => this.errorMsg = 'Failed to delete.' });
  }

  icon(cat?: string) {
    const m: Record<string, string> = { Electronics:'📱', Documents:'🪪', 'Personal Items':'🎒', 'Books & Notes':'📚', Clothing:'👕', Keys:'🔑', Other:'📦' };
    return m[cat || ''] || '📦';
  }
}
