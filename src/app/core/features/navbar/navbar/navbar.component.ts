import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goToAccount(): void {

    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    // Always go to dashboard redirect
    this.router.navigate(['/dashboard']);
  }
}