import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface CustomJwtPayload extends JwtPayload {
  exp: number;
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const user = authService.getUser();
    const token = authService.getToken();

    if (!token || !user) {
      authService.logout();
      return router.createUrlTree(['/signin'], { queryParams: { returnUrl: state.url } });
    }

    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (!decodedToken.exp || decodedToken.exp < currentTime) {
      authService.logout();
      return router.createUrlTree(['/signin'], { queryParams: { returnUrl: state.url, expired: 'true' } });
    }

    const allowedRoles = ['Admin', 'Tenant'];
    const hasValidRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasValidRole) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;

  } catch (error) {
    console.error('Auth Guard Error:', error);
    authService.logout();
    return router.createUrlTree(['/signin'], { queryParams: { returnUrl: state.url, error: 'invalid' } });
  }
};
