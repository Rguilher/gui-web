import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav'; // Importando Sidenav
import { MatListModule } from '@angular/material/list'; // Importando Listas para o menu
import { LoadingService } from '../../services/loading.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  protected loadingService = inject(LoadingService);
  protected authService = inject(AuthService);

  isAdmin = signal<boolean>(false);
  isProfessional = signal<boolean>(false);

  ngOnInit(): void {
    const roles = this.authService.getUserRoles();

    this.isAdmin.set(roles.includes('ADMIN'));

    this.isProfessional.set(
      roles.includes('PROFESSIONAL') || roles.includes('ADMIN'),
    );
  }

  logout() {
    this.authService.logout();
  }
}
