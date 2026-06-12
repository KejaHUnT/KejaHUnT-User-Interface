import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';
import { take } from 'rxjs/operators';
import { Tenant } from 'src/app/features/tenant/models/tenant.model';

@Injectable({ providedIn: 'root' })
export class NavRoutingHelper {
  constructor(
    private authService: AuthService,
    private tenantService: TenantService,
    private router: Router,
  ) {}

  /**
   * Resolves the correct portal route for the current user.
   * - Manager / Admin  → /portal/manage
   * - Tenant           → /portal/tenant/:id
   * - Unauthenticated  → /signin
   * - No role yet      → /get-started (kept as fallback; you can remove once all users have roles)
   */
  goToPortal(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const roles: string[] = user.roles ?? [];

    if (roles.includes('Admin') || roles.includes('Manager')) {
      this.router.navigate(['/portal/manage']);
      return;
    }

    if (roles.includes('Tenant')) {
      this.redirectTenant(user.email);
      return;
    }

    // Fallback: user is authenticated but has no recognised role yet.
    // Remove this branch once you retire /get-started.
    this.router.navigate(['/get-started']);
  }

  /**
   * Navigates to Add Property, guarding with auth + role check.
   * Kept here so any future component can reuse without duplicating logic.
   */
  goToAddProperty(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const roles: string[] = user.roles ?? [];

    if (roles.includes('Admin') || roles.includes('Manager')) {
      this.router.navigate(['/admin/property/add']);
    } else {
      // Tenant or unknown role: redirect to their own portal instead
      this.goToPortal();
    }
  }

  /** Returns true when a user session exists. */
  isLoggedIn(): boolean {
    return !!this.authService.getUser();
  }

  /** Returns the current user's display name, or null. */
  getDisplayName(): string | null {
    const user = this.authService.getUser();
    return user?.email ?? null;
  }

  /** Returns a short role label for display (e.g. in the nav badge). */
  getRoleLabel(): string | null {
    const user = this.authService.getUser();
    if (!user) return null;

    const roles: string[] = user.roles ?? [];
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('Manager')) return 'Manager';
    if (roles.includes('Tenant')) return 'Tenant';
    return null;
  }

  private redirectTenant(email: string): void {
    this.tenantService
      .getTenantByEmail(email)
      .pipe(take(1))
      .subscribe({
        next: (tenant: Tenant) => {
          this.router.navigate([`/portal/tenant/${tenant.id}`]);
        },
        error: () => {
          this.router.navigate(['/get-started']);
        },
      });
  }
}
