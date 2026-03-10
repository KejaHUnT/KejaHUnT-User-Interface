import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';
import { take } from 'rxjs/operators';
import { Tenant } from 'src/app/features/tenant/models/tenant.model';

@Component({
  selector: 'app-dashboard-redirect',
  template: ''
})
export class DashboardRedirectComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const roles: string[] = user.roles ?? [];

    // Manager Dashboard
    if (roles.includes('Manager')) {
      this.router.navigate(['/portal/manage']);
      return;
    }

    // Tenant Dashboard
    if (roles.includes('Tenant')) {
      this.redirectTenant(user.email);
      return;
    }

    // New User
    this.router.navigate(['/get-started']);
  }

  private redirectTenant(email: string) {

    this.tenantService
      .getTenantByEmail(email)
      .pipe(take(1))
      .subscribe({

        next: (tenant: Tenant) => {
          this.router.navigate([`/portal/tenant/${tenant.id}`]);
        },

        error: () => {
          this.router.navigate(['/get-started']);
        }

      });
  }
}