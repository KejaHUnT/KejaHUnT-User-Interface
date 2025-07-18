import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import {jwtDecode} from 'jwt-decode'; // ✅ Correct import

export const authGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = cookieService.get('Authorization');
  const user = authService.getUser(); // Should return a user object with roles

  if (token && user) {
    try {
      const decodedToken: any = jwtDecode(token.replace('Bearer ', '')); // ✅ Correct usage
      const expirationDate = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = new Date().getTime();

      if (expirationDate < currentTime) {
        // Token expired
        authService.logout();
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }

      if (user.roles?.includes('Tenant')) {
        return true;
      } else {
        alert('Unauthorized');
        return false;
      }

    } catch (error) {
      console.error('JWT decode failed:', error);
      authService.logout();
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
  }

  // Not logged in
  authService.logout();
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
