import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NewAppointmentComponent } from './features/appointments/new-appointment/new-appointment.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // --- Rotas Públicas (Sem Layout Global) ---
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full', // Garante que só carrega na raiz exata
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

  // --- Rotas Protegidas (Dentro do MainLayout) ---
  {
    path: '', // Rota "Virtual" para aplicar o Layout
    component: MainLayoutComponent,
    canActivate: [authGuard], // Protege todas as filhas de uma vez
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'appointments/new', component: NewAppointmentComponent },
      // Futuras rotas protegidas virão aqui (ex: profile, history)
    ],
  },

  // --- Wildcard (Sempre por último) ---
  { path: '**', redirectTo: '' },
];
