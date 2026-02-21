import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NewAppointmentComponent } from './features/appointments/new-appointment/new-appointment.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'cadastrar', component: RegisterComponent },

  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'appointments/new', component: NewAppointmentComponent },
      {
        path: 'minha-agenda',
        loadComponent: () =>
          import('./features/professional-agenda/professional-agenda.component').then(
            (c) => c.ProfessionalAgendaComponent,
          ),
        data: { roles: ['PROFISSIONAL', 'ADMIN'] },
      },
      {
        path: 'admin/usuarios',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then(
            (c) => c.UserManagementComponent,
          ),
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (c) => c.AdminDashboardComponent,
          ),
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'painel-do-profissional',
        loadComponent: () =>
          import('./features/professional/professional-dashboard/professional-dashboard.component').then(
            (c) => c.ProfessionalDashboardComponent,
          ),
        data: { roles: ['PROFESSIONAL', 'ADMIN'] },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
