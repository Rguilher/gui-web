import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica o valor do signal (true se tiver token, false se não)
  if (authService.isAuthenticated()) {
    return true; // Acesso liberado
  }

  // Se não estiver logado, redireciona para o login
  router.navigate(['/login']);
  return false; // Acesso negado
};
