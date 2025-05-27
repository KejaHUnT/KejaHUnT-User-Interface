import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingRequest } from '../models/booking-request.model';
import { BookingResponse } from '../models/booking-response.model';
import { environment } from 'src/environments/environment';
import { UpdateBookingStatus } from '../models/update-booking-status.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) { }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${environment.bookingApiBaseUrl}/api/booking`, request);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${environment.bookingApiBaseUrl}/api/booking`);
  }

  getBookingByReference(reference: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${environment.bookingApiBaseUrl}/api/booking/${reference}`);
  }

  getBookingsByTenantId(tenantId: number): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${environment.bookingApiBaseUrl}/api/booking/tenant/${tenantId}`);
  }

  requestStkPush(bookingId: number): Observable<any> {
    return this.http.get<any>(`${environment.bookingApiBaseUrl}/api/booking/pay/${bookingId}`, {});
  }

  updateBookingStatus(request: UpdateBookingStatus): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${environment.bookingApiBaseUrl}/api/booking/status`, request);
  }
}
