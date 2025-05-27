import { Component, OnInit } from '@angular/core';
import { BookingResponse } from '../../models/booking-response.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../../../services/unit.service';
import { BookingService } from '../../services/booking.service';
import { BookingRequest } from '../../models/booking-request.model';

@Component({
  selector: 'app-create-booking-request',
  templateUrl: './create-booking-request.component.html',
  styleUrls: ['./create-booking-request.component.css']
})
export class CreateBookingRequestComponent implements OnInit {
  unitId!: number;
  unitDetails!: Unit;
  tenantId!: number;
  notes: string = '';
  bookingResponse?: BookingResponse;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private unitService: UnitService
  ) {}

  ngOnInit(): void {
    // Step 1: Extract unitId from route params
    this.route.queryParams.subscribe(params => {
      this.unitId = +params['unitId'];
      this.getUnitDetails(this.unitId);
    });

    // Step 2: Get tenantId from localStorage or auth service
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      this.tenantId = +storedTenantId;
    } else {
      this.errorMessage = 'Tenant ID not found. Please log in.';
    }
  }

  // Step 3: Fetch unit details from API
  getUnitDetails(unitId: number): void {
    this.unitService.getUnitById(unitId.toString()).subscribe({
      next: (data) => {
        this.unitDetails = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load unit details.';
        console.error(err);
      }
    });
  }

  // Step 4: Send booking request
  confirmBooking(): void {
    if (!this.unitId || !this.tenantId) {
      this.errorMessage = 'Invalid unit or tenant.';
      return;
    }

    const bookingRequest: BookingRequest = {
      unitId: this.unitId,
      tenentId: this.tenantId,
      notes: this.notes
    };

    this.isSubmitting = true;

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response) => {
        this.bookingResponse = response;
        this.isSubmitting = false;
        // Optionally navigate to a booking summary or confirmation page
        this.router.navigate(['/booking/summary'], {
          queryParams: { reference: response.bookingReference }
        });
        
      },
      error: (err) => {
        this.errorMessage = 'Booking failed. Please try again.';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }

  

}
