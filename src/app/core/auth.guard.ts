import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  } else {
    if (state.url.includes('/receipt')) {
      return true;
    } else {
      router.navigate(['/login'], {
        queryParams: {
          redirect: state.url,
          reason: 'unauthorized'
        }
      });
      return false;
    }
  }
};
