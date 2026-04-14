import { Routes } from '@angular/router';
import { ItemListComponent } from './pages/item-list/item-list.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ItemFormComponent } from './pages/item-form/item-form.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },

  { path: 'items', component: ItemListComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'report-item', component: ItemFormComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '**', redirectTo: 'items' }
];
