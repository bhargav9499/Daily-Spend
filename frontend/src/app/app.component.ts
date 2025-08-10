import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dailyspend-web';
  // msg = 'checking...';
  // private api = inject(ApiService);

  // ngOnInit() {
  //   this.api.health().subscribe({
  //     next: (t) => (this.msg = String(t)),
  //     error: (e) =>
  //       (this.msg = 'API error: ' + (e?.message || e.statusText || 'unknown')),
  //   });
  // }
}
