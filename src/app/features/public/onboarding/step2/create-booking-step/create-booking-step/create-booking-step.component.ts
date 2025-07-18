import { Component, Input } from '@angular/core';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { BookingService } from 'src/app/features/unit/booking-preview/services/booking.service';
import { BookingRequest } from 'src/app/features/unit/booking-preview/models/booking-request.model';
import { MatStepper } from '@angular/material/stepper';

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
  unitImageUrl: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private unitService: UnitService,
    private propertyService: PropertyService,
    private bookingService: BookingService,
    private imageService: ImageService
  ) {}

  initialize(unitId: number, tenantId: number): void {
    this.unitId = unitId;
    this.tenantId = tenantId;
    this.fetchUnitDetails(unitId);
  }

  private fetchUnitDetails(unitId: number): void {
    this.unitService.getUnitById(unitId.toString()).subscribe({
      next: (unit) => {
        this.unit = unit;

        if (unit.documentId) {
          this.imageService.getFileByDocumentId(unit.documentId).subscribe({
            next: (file: FileResponse) => {
              this.unitImageUrl = `data:image/${file.extension.replace('.', '')};base64,${file.base64}`;
            }
          });
        }

        if (unit.propertyId) {
          this.propertyService.getPopertyById(unit.propertyId.toString()).subscribe({
            next: (property) => {
              this.property = property;
            }
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load unit details';
        console.error(err);
      }
    });
  }

  confirmBooking(): void {
    if (!this.unitId || !this.tenantId) {
      this.errorMessage = 'Invalid unit or tenant ID';
      return;
    }

    const bookingRequest: BookingRequest = {
      unitId: this.unitId,
      tenentId: this.tenantId,
      notes: ''
    };

    this.isSubmitting = true;

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.stepper.next(); // advance to the next step
      },
      error: (err) => {
        this.errorMessage = 'Booking failed';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}
