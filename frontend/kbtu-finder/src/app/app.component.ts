import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component'; // Adjust path if needed

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar> <main class="container mt-4">
      <router-outlet></router-outlet> </main>
  `,
  styleUrl: './app.css'
})
export class AppComponent {
  protected readonly title = signal('kbtu-finder');
}
