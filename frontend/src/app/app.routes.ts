import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'items', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
  { path: 'items/:id', loadComponent: () => import('./components/item-detail/item-detail.component').then(m => m.ItemDetailComponent) },
  { path: 'report', loadComponent: () => import('./components/report-item/report-item.component').then(m => m.ReportItemComponent), canActivate: [authGuard] },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'chat', loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'items' }
];
