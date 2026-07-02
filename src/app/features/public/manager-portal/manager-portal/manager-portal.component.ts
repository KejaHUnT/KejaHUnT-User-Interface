import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { User } from 'src/app/features/auth/models/user.model';
import { BookingService } from 'src/app/features/unit/booking-preview/services/booking.service';
import { PendingReservation } from 'src/app/features/unit/booking-preview/models/pending-reservation.model';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';
import { Tenant } from 'src/app/features/tenant/models/tenant.model';

@Component({
  selector: 'app-manager-portal',
  templateUrl: './manager-portal.component.html',
  styleUrls: ['./manager-portal.component.css']
})
export class ManagerPortalComponent implements OnInit {

  Property$?: Observable<(Property & { expanded?: boolean })[]>;
  propertiesIncome: { [key: string]: number } = {};
  totalExpectedIncome: number = 0;
  pendingBills: number = 0;
  pendingReservations$?: Observable<PendingReservation[]>;  
  pendingTenants: Tenant[] = [];
  

  // ✅ Logged-in user
  loggedInUser?: User;
  today: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private router: Router,
    private authService: AuthService,  // ✅ Inject AuthService  
    private bookingService: BookingService,  
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {

    // ✅ Subscribe to logged-in user
    this.authService.user().subscribe(user => {
      this.loggedInUser = user;
    });

    // ✅ Load properties for logged-in user
    this.Property$ = new Observable<(Property & { expanded?: boolean })[]>(observer => {
      this.propertyService.getPropertiesForLoggedInUser().subscribe(properties => {

        const propsWithExpand = properties.map(p => ({
          ...p,
          expanded: false
        }));

        this.calculateIncome(propsWithExpand);
        observer.next(propsWithExpand);
      });
    });
    this.pendingReservations$ = this.bookingService.getPendingReservations();  
    this.tenantService.getPendingTenants().subscribe({
      next: (tenants) => this.pendingTenants = tenants,
      error: (err) => console.error('Failed to load pending tenants', err)
    });
  }

  calculateIncome(properties: Property[]): void {
    let totalIncome = 0;
    let totalPending = 0;

    properties.forEach(property => {
      let propertyIncome = 0;

      if (property.units && property.units.length > 0) {
        property.units.forEach(unit => {
          const unitPrice = unit.price || 0;
          propertyIncome += unitPrice;

          if (
            unit.status?.toLowerCase() === 'pending' ||
            unit.status?.toLowerCase() === 'unpaid'
          ) {
            totalPending += unitPrice;
          }
        });
      }

      this.propertiesIncome[property.name] = propertyIncome;
      totalIncome += propertyIncome;
    });

    this.totalExpectedIncome = totalIncome;
    this.pendingBills = totalPending;
  }

  /** === NAVIGATION ACTIONS === */
  goToEditUnit(propId: number): void {
    this.router.navigate(['payment/', propId]);
  }

  goToManageUnits(propertyId: number): void {
    this.router.navigate([`/manage/${propertyId}/units`]);
  }

  navigateToProperties(): void {
    this.router.navigate(['/admin/property']);
  }

  navigateToIncome(): void {
    this.router.navigate(['/income']);
  }

  navigateToPending(): void {
    this.router.navigate(['/pending-bills']);
  }
  approveReservation(bookingId: number): void {
    this.bookingService.approveReservation(bookingId).subscribe(() => {
      this.pendingReservations$ = this.bookingService.getPendingReservations();
    });
  }
  rejectReservation(bookingId: number): void {
    this.bookingService.rejectReservation(bookingId).subscribe(() => {
      this.pendingReservations$ = this.bookingService.getPendingReservations();
    });
  }
  approveTenantRequest(id: number): void {
    this.tenantService.approveTenant(id).subscribe({
      next: () => {
        this.pendingTenants = this.pendingTenants.filter(t => t.id !== id);
      },
      error: (err) => console.error('Failed to approve tenant', err)
    });
  }
  
}
