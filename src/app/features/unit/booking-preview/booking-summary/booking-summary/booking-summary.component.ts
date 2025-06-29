import { Component, OnInit } from '@angular/core';
import { BookingResponse } from '../../models/booking-response.model';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.css']
})
export class BookingSummaryComponent implements OnInit {
  booking: BookingResponse | null = null;
  bookingReference: string = '';
  phoneNumber: string = '';
  errorMessage = '';
  showModal: boolean = false; // Modal visibility toggle

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.bookingReference = params['reference'];
      if (this.bookingReference) {
        this.fetchBookingDetails(this.bookingReference);
      } else {
        this.errorMessage = 'Booking reference not provided.';
      }
    });
  }

  fetchBookingDetails(reference: string): void {
    this.bookingService.getBookingByReference(reference).subscribe({
      next: (booking) => {
        this.booking = booking;
      },
      error: () => {
        this.errorMessage = 'Failed to fetch booking information.';
      }
    });
  }

  requestStkPush(): void {
  if (!this.booking || !this.booking.id) {
    this.errorMessage = 'Cannot initiate payment. Booking ID missing.';
    return;
  }

  if (!this.phoneNumber) {
    this.errorMessage = 'Phone number is required.';
    return;
  }

  this.bookingService.requestStkPush(this.booking.id, this.phoneNumber).subscribe({
    next: (response) => {
      // If the backend ever starts returning valid JSON
      console.log('STK Push initiated:', response);
      alert('Payment request sent to your phone. Please complete the transaction.');
    },
    error: (err) => {
      if (err instanceof HttpErrorResponse && err.status === 200) {
        // Backend returned plain text (e.g., "STK Push initiated") with HTTP 200
        console.warn('Handled text/plain success response:', err.error?.text || err.error);
        alert('Payment request sent to your phone. Please complete the transaction.');
      } else {
        this.errorMessage = 'Failed to initiate payment.';
        console.error(err);
      }
    }
  });
}


  // Modal Controls
  openModal(): void {
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitPhoneAndPay(): void {
    this.closeModal();
    this.requestStkPush();
  }
}
