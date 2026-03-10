import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.css']
})
export class GetStartedComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  createProperty(): void {

    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    // Redirect to Add Property page
    this.router.navigate(['/admin/property/add']);
  }

  listProperties(): void {

    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    // Redirect to Manager Portal
    this.router.navigate(['/portal/manage']);
  }

}