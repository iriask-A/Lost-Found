import { Routes } from '@angular/router';
import { ItemListComponent } from './pages/item-list/item-list.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ItemFormComponent } from './pages/item-form/item-form.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },

  { path: 'items', component: ItemListComponent },
  { path: 'items/new', component: ItemFormComponent, canActivate: [AuthGuard] },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'items/:id/edit', component: ItemFormComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'items' }
];
