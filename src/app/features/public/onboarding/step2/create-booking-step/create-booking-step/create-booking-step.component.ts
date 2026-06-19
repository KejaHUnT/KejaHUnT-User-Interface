import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { BookingService } from 'src/app/features/unit/booking-preview/services/booking.service';
import { BookingRequest } from 'src/app/features/unit/booking-preview/models/booking-request.model';

@Component({
  selector: 'app-create-booking-step',
  templateUrl: './create-booking-step.component.html',
  styleUrls: ['./create-booking-step.component.css']
})
export class CreateBookingStepComponent {
  @Input() unitId!: number;
  @Input() tenantId!: number;
  @Input() stepper!: MatStepper;

  unit?: Unit;
  bookingReference: string = '';
  property?: Property;
  unitImageUrl = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private unitService: UnitService,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  /** Called by the stepper wrapper after tenant is persisted */
  initialize(unitId: number, tenantId: number): void {
    this.unitId = unitId;
    this.tenantId = tenantId;
    this.errorMessage = '';
    this.fetchUnitDetails(unitId);
  }

  private fetchUnitDetails(unitId: number): void {
    this.unitService.getUnitById(unitId.toString()).subscribe({
      next: unit => {
        this.unit = unit;
                this.unitImageUrl = unit.imageUrl ?? '';

        if (unit.propertyId) {
          this.propertyService.getPopertyById(unit.propertyId.toString()).subscribe({
            next: property => (this.property = property),
            error: () => (this.errorMessage = 'Could not load property details.')
          });
        }
      },
      error: () => (this.errorMessage = 'Could not load unit details.')
    });
  }

  private buildBookingRequest(notes: string): BookingRequest {
    return {
      unitId: this.unitId,
      tenentId: this.tenantId,  // preserving existing typo to match model
      notes
    };
  }

  reserveLater(): void {
    if (!this.tenantId || !this.unitId) {
      this.errorMessage = 'Missing booking details. Please restart the flow.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookingService.reserveUnit(this.buildBookingRequest('Existing tenant reservation')).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/portal/tenant', this.tenantId]);
      },
      error: () => {
        this.errorMessage = 'Reservation failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  payNow(): void {
    if (!this.tenantId || !this.unitId) {
      this.errorMessage = 'Missing booking details. Please restart the flow.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookingService.createBooking(this.buildBookingRequest('Immediate payment booking')).subscribe({
      next: (booking) => {
        this.isSubmitting = false;
        this.bookingReference = booking.bookingReference;
        if (this.stepper) {
          setTimeout(() => this.stepper.next(), 0);
        }
      },    
      error: () => {
        this.errorMessage = 'Booking failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}