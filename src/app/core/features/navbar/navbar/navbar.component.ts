import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { NavRoutingHelper } from '../nav-routing/nav-routing-helper.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false;

  private routerSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    public nav: NavRoutingHelper, // public → accessible in template
  ) {}

  ngOnInit(): void {
    // Close mobile drawer on any navigation
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileMenu());
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isScrolled = window.scrollY > 12;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  goToPortal(): void {
    this.closeMobileMenu();
    this.nav.goToPortal();
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout(); // adjust to your actual logout method/observable
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
