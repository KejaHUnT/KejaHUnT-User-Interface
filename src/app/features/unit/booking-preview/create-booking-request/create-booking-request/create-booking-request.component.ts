import { Component, OnInit } from '@angular/core';
import { BookingResponse } from '../../models/booking-response.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../../../services/unit.service';
import { BookingService } from '../../services/booking.service';
import { BookingRequest } from '../../models/booking-request.model';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';

@Component({
  selector: 'app-create-booking-request',
  templateUrl: './create-booking-request.component.html',
  styleUrls: ['./create-booking-request.component.css']
})
export class CreateBookingRequestComponent implements OnInit {
  unitId!: number;
  unitDetails!: Unit;
  unitImageUrl: string = '';
  tenantId!: number;
  notes: string = '';
  bookingResponse?: BookingResponse;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private unitService: UnitService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.unitId = +params['unitId'];
      this.getUnitDetails(this.unitId);
    });

    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      this.tenantId = +storedTenantId;
    }
  }

  getUnitDetails(unitId: number): void {
    this.unitService.getUnitById(unitId.toString()).subscribe({
      next: (data) => {
        this.unitDetails = data;

        // Fetch the image using documentId
        if (this.unitDetails.documentId) {
          this.imageService.getFileByDocumentId(this.unitDetails.documentId).subscribe({
            next: (fileResponse: FileResponse) => {
              this.unitImageUrl = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
            },
            error: (err) => {
              console.error('Error fetching unit image', err);
            }
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load unit details.';
        console.error(err);
      }
    });
  }

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
