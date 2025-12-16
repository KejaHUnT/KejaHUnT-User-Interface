import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';
import { Tenant } from 'src/app/features/tenant/models/tenant.model';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goToAccount(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const roles = user.roles || [];

    // If user is Manager
    if (roles.includes('Manager')) {
      this.router.navigate(['/portal/manage']);
      return;
    }

    // If user is Tenant
    if (roles.includes('Tenant')) {
      const email = user.email;

      this.tenantService.getTenantByEmail(email).subscribe({
        next: (tenant: Tenant) => {
          this.router.navigate([`/portal/tenant/${tenant.id}`]);
        },
        error: (err) => {
          console.error('Failed to fetch tenant:', err);
          this.router.navigate(['/signin']);
        }
      });
      return;
    }

    // Default fallback
    this.router.navigate(['/signin']);
  }
}
