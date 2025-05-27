import { Component, OnInit } from '@angular/core';
import { BookingResponse } from '../../models/booking-response.model';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.css']
})
export class BookingSummaryComponent implements OnInit {
  booking: BookingResponse | null = null;
  bookingReference: string = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    // Extract the bookingReference from query parameters
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
  
    this.bookingService.requestStkPush(this.booking.id).subscribe({
      next: (response) => {
        console.log('STK Push initiated:', response);
        alert('Payment request sent to your phone. Please complete the transaction.');
      },
      error: (err) => {
        this.errorMessage = 'Failed to initiate payment.';
        console.error(err);
      }
    });
  }
  

}
