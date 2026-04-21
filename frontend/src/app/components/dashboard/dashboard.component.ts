import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { ClaimService } from '../../services/claim.service';
import { AuthService } from '../../services/auth.service';
import { Item, ClaimRequest } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  template: `
    <div class="page">

      <div class="page-head">
        <div class="ph-label">Account</div>
        <h1 class="ph-title">{{ auth.currentUser?.username }}<em>'s</em><br>Dashboard</h1>
      </div>

      <div class="dash-stats">
        <div class="dstat"><div class="dstat-n">{{ myItems.length }}</div><div class="dstat-l">Items reported</div></div>
        <div class="dstat"><div class="dstat-n">{{ myClaims.length }}</div><div class="dstat-l">Claim requests</div></div>
        <div class="dstat"><div class="dstat-n">{{ pendingCount }}</div><div class="dstat-l">Pending reviews</div></div>
      </div>

      <div class="dash-grid">

        <!-- Left -->
        <div>
          <!-- My claim requests -->
          <div class="section">
            <div class="sec-head">
              <span class="sec-title">My Claims</span>
              <a routerLink="/items" class="sec-link">Browse →</a>
            </div>
            @if (myClaims.length === 0) {
              <div class="empty-row">You haven't claimed any items yet.</div>
            }
            @for (c of myClaims; track c.id) {
              <div class="row">
                <span class="row-icon">{{ icon(c.item?.category?.name) }}</span>
                <div class="row-info">
                  <div class="row-name">{{ c.item?.name }}</div>
                  <div class="row-sub">📍 {{ c.item?.location?.name }} · {{ c.created_at | date:'mediumDate' }}</div>
                </div>
                <span class="badge" [class]="'b-'+c.status">{{ c.status }}</span>
                @if (c.status === 'pending') {
                  <button class="btn-sm rust" (click)="withdraw(c.id)">Withdraw</button>
                }
              </div>
            }
          </div>

          <!-- My reported items -->
          <div class="section">
            <div class="sec-head">
              <span class="sec-title">My Reports</span>
              <a routerLink="/report" class="sec-link">Add new →</a>
            </div>
            @if (myItems.length === 0) {
              <div class="empty-row">You haven't reported any items. <a routerLink="/report" class="il-link">Report one →</a></div>
            }
            @for (item of myItems; track item.id) {
              <div class="row">
                <span class="row-icon">{{ icon(item.category?.name) }}</span>
                <div class="row-info">
                  <div class="row-name">{{ item.name }}</div>
                  <div class="row-sub">📍 {{ item.location?.name }} · {{ item.date_found }}</div>
                </div>
                <span class="badge" [class]="'b-'+item.status">{{ item.status }}</span>
                <a [routerLink]="['/items', item.id]" class="btn-sm">View</a>
                @if (item.status === 'claimed') {
                  <button class="btn-sm cork" (click)="loadClaims(item)">Review</button>
                }
              </div>
            }
          </div>
        </div>

        <!-- Right -->
        <div>
          <!-- Review panel -->
          @if (reviewItem) {
            <div class="section highlight">
              <div class="sec-head">
                <span class="sec-title">Claims for "{{ reviewItem.name }}"</span>
                <button class="sec-link" (click)="reviewItem=null;reviewClaims=[]" style="background:none;border:none;cursor:pointer">Close</button>
              </div>
              @if (reviewClaims.length === 0) {
                <div class="empty-row">No claims yet.</div>
              }
              @for (c of reviewClaims; track c.id) {
                <div class="review-block">
                  <div class="review-who">
                    <div class="av">{{ c.claimed_by?.username?.charAt(0)?.toUpperCase() }}</div>
                    <div>
                      <div class="row-name">{{ c.claimed_by?.username }}</div>
                      <div class="row-sub">{{ c.created_at | date:'mediumDate' }}</div>
                    </div>
                    <span class="badge" [class]="'b-'+c.status" style="margin-left:auto">{{ c.status }}</span>
                  </div>
                  <p class="review-msg">"{{ c.message }}"</p>
                  @if (c.status === 'pending') {
                    <div class="review-btns">
                      <button class="btn-sm green" (click)="resolve(c.id,'approved')">Approve</button>
                      <button class="btn-sm rust"  (click)="resolve(c.id,'rejected')">Reject</button>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Account card -->
          <div class="section">
            <div class="sec-head"><span class="sec-title">Account</span></div>
            <div class="acc-rows">
              <div class="acc-row"><span>Username</span><span>{{ auth.currentUser?.username }}</span></div>
              <div class="acc-row"><span>Email</span><span>{{ auth.currentUser?.email }}</span></div>
              <div class="acc-row"><span>Name</span><span>{{ auth.currentUser?.first_name }} {{ auth.currentUser?.last_name }}</span></div>
            </div>
            <button class="btn-logout" (click)="auth.logout()">Sign out →</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 48px 28px 80px; }
    .page-head { border-bottom: 1px solid var(--border); padding-bottom: 36px; margin-bottom: 36px; }
    .ph-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cork); margin-bottom: 10px; }
    .ph-title { font-family: var(--font-display); font-size: 52px; font-weight: 900; line-height: 0.95; color: var(--ink); letter-spacing: -1.5px; }
    .ph-title em { color: var(--cork); font-style: italic; }
    .dash-stats { display: flex; gap: 0; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 36px; }
    .dstat { flex: 1; padding: 20px 24px; background: var(--sand); border-right: 1px solid var(--border); }
    .dstat:last-child { border-right: none; }
    .dstat-n { font-family: var(--font-display); font-size: 36px; font-weight: 900; color: var(--espresso); line-height: 1; }
    .dstat-l { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-top: 4px; }
    .dash-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
    .section { background: var(--sand); border: 1px solid var(--border); border-radius: 3px; padding: 20px; margin-bottom: 14px; }
    .section.highlight { border-color: var(--cork); }
    .sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .sec-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--ink); }
    .sec-link { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cork); transition: color 0.15s; }
    .sec-link:hover { color: var(--rust); }
    .empty-row { font-size: 13px; color: var(--muted); padding: 8px 0; }
    .il-link { color: var(--rust); }
    .row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border2); }
    .row:last-child { border-bottom: none; }
    .row-icon { font-size: 20px; flex-shrink: 0; }
    .row-info { flex: 1; min-width: 0; }
    .row-name { font-size: 13px; font-weight: 500; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .row-sub { font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-top: 2px; }
    .badge { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 2px; white-space: nowrap; flex-shrink: 0; }
    .b-open     { background: rgba(45,74,53,0.1); color: var(--green); border: 1px solid rgba(45,74,53,0.2); }
    .b-claimed, .b-pending  { background: rgba(122,92,58,0.1); color: var(--brown); border: 1px solid rgba(122,92,58,0.2); }
    .b-closed, .b-approved  { background: rgba(45,74,53,0.1); color: var(--green); border: 1px solid rgba(45,74,53,0.2); }
    .b-rejected { background: rgba(196,88,30,0.1); color: var(--rust); border: 1px solid rgba(196,88,30,0.2); }
    .btn-sm { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 2px; cursor: pointer; background: none; border: 1px solid var(--border); color: var(--brown); transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
    .btn-sm:hover { border-color: var(--brown); }
    .btn-sm.rust  { border-color: rgba(196,88,30,0.3); color: var(--rust); }
    .btn-sm.rust:hover  { background: rgba(196,88,30,0.08); }
    .btn-sm.green { border-color: rgba(45,74,53,0.3); color: var(--green); }
    .btn-sm.green:hover { background: rgba(45,74,53,0.08); }
    .btn-sm.cork  { border-color: rgba(184,154,110,0.4); color: var(--cork); }
    .btn-sm.cork:hover  { background: rgba(184,154,110,0.1); }
    .review-block { border-bottom: 1px solid var(--border2); padding: 12px 0; }
    .review-block:last-child { border-bottom: none; }
    .review-who { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .av { width: 26px; height: 26px; border-radius: 50%; background: var(--espresso); color: var(--cream); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .review-msg { font-size: 12px; color: var(--brown); font-style: italic; line-height: 1.5; margin-bottom: 10px; }
    .review-btns { display: flex; gap: 8px; }
    .acc-rows { border-top: 1px solid var(--border); margin-bottom: 16px; }
    .acc-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border2); font-size: 13px; }
    .acc-row span:first-child { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
    .acc-row span:last-child { color: var(--ink); font-weight: 500; }
    .btn-logout { width: 100%; padding: 10px; background: var(--espresso); color: var(--cream); border: none; border-radius: 3px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; transition: background 0.15s; }
    .btn-logout:hover { background: var(--brown); }
  `]
})
export class DashboardComponent implements OnInit {
  myItems: Item[] = []; myClaims: ClaimRequest[] = [];
  reviewItem: Item | null = null; reviewClaims: ClaimRequest[] = [];

  constructor(public auth: AuthService, private itemSvc: ItemService, private claimSvc: ClaimService) {}

  get pendingCount() { return this.myItems.filter(i => i.status === 'claimed').length; }

  ngOnInit() {
    this.itemSvc.getMyItems().subscribe(d => this.myItems = d);
    this.claimSvc.getMyClaims().subscribe(d => this.myClaims = d);
  }

  loadClaims(item: Item) { this.reviewItem = item; this.claimSvc.getItemClaims(item.id).subscribe(d => this.reviewClaims = d); }
  withdraw(id: number) { if (!confirm('Withdraw this claim?')) return; this.claimSvc.withdrawClaim(id).subscribe({ next: () => this.myClaims = this.myClaims.filter(c => c.id !== id) }); }
  resolve(id: number, action: 'approved' | 'rejected') {
    this.claimSvc.resolveClaim(id, action).subscribe({ next: () => {
      this.reviewClaims = this.reviewClaims.map(c => c.id === id ? { ...c, status: action } : c);
      this.itemSvc.getMyItems().subscribe(d => this.myItems = d);
    }});
  }
  icon(cat?: string) {
    const m: Record<string, string> = { Electronics:'📱', Documents:'🪪', 'Personal Items':'🎒', 'Books & Notes':'📚', Clothing:'👕', Keys:'🔑', Other:'📦' };
    return m[cat || ''] || '📦';
  }
}
