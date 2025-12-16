import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
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
  property?: Property;
  unitImageUrl = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private unitService: UnitService,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private imageService: ImageService,
    private router: Router
  ) {}

  initialize(unitId: number, tenantId: number): void {
    this.unitId = unitId;
    this.tenantId = tenantId;
    this.fetchUnitDetails(unitId);
  }

  private fetchUnitDetails(unitId: number): void {
    this.unitService.getUnitById(unitId.toString()).subscribe(unit => {
      this.unit = unit;

      if (unit.documentId) {
        this.imageService.getFileByDocumentId(unit.documentId).subscribe(
          (file: FileResponse) =>
            this.unitImageUrl =
              `data:image/${file.extension.replace('.', '')};base64,${file.base64}`
        );
      }

      if (unit.propertyId) {
        this.propertyService
          .getPopertyById(unit.propertyId.toString())
          .subscribe(property => this.property = property);
      }
    });
  }

  reserveLater(): void {
    const request: BookingRequest = {
      unitId: this.unitId,
      tenentId: this.tenantId,
      notes: 'Reserved for later payment'
    };

    this.isSubmitting = true;

    this.bookingService.createBooking(request).subscribe({
      next: () => {
        this.isSubmitting = false;
       this.router.navigate(['/portal/tenant', this.tenantId]);
      },
      error: () => {
        this.errorMessage = 'Reservation failed';
        this.isSubmitting = false;
      }
    });
  }

  payNow(): void {
    const request: BookingRequest = {
      unitId: this.unitId,
      tenentId: this.tenantId,
      notes: 'Immediate payment booking'
    };

    this.isSubmitting = true;

    this.bookingService.createBooking(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.stepper.next(); 
      },
      error: () => {
        this.errorMessage = 'Booking failed';
        this.isSubmitting = false;
      }
    });
  }
}
