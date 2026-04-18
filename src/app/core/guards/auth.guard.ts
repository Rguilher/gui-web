import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Array<string>;

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = authService.getUserRoles();
    const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
