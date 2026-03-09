import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import {
  InitializePaymentRequest,
  InitializePaymentResponse,
  PaymentResponse
} from '../models/paystack-models';

@Injectable({
  providedIn: 'root'
})
export class PaystackPaymentService {

  private baseUrl = `${environment.paymentApiBaseUrl}/api/Payments`;

  constructor(private http: HttpClient) { }

  // =====================================================
  // INITIALIZE PAYMENT
  // POST: /api/Payments/initialize
  // =====================================================
  initializePayment(
    request: InitializePaymentRequest
  ): Observable<InitializePaymentResponse> {

    return this.http.post<InitializePaymentResponse>(
      `${this.baseUrl}/initialize`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================================
  // VERIFY PAYMENT
  // GET: /api/Payments/verify/{reference}
  // =====================================================
  verifyPayment(reference: string): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/verify/${reference}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================================
  // GET PAYMENTS BY USER
  // GET: /api/Payments/user/{email}?pageNumber=1&pageSize=20
  // =====================================================
  getPaymentsByUser(
    email: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<PaymentResponse[]> {

    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PaymentResponse[]>(
      `${this.baseUrl}/user/${email}`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================================
  // GET PAYMENTS BY UNIT
  // GET: /api/Payments/unit/{unitId}
  // =====================================================
  getPaymentsByUnit(
    unitId: number,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<PaymentResponse[]> {

    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PaymentResponse[]>(
      `${this.baseUrl}/unit/${unitId}`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================================
  // GET PAYMENTS BY PROPERTY
  // GET: /api/Payments/property/{propertyId}
  // =====================================================
  getPaymentsByProperty(
    propertyId: number,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<PaymentResponse[]> {

    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PaymentResponse[]>(
      `${this.baseUrl}/property/${propertyId}`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =====================================================
  // ERROR HANDLING (Production Style)
  // =====================================================
  private handleError(error: HttpErrorResponse) {

    let errorMessage = 'Something went wrong while processing the payment.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    }
    else if (error.status === 0) {
      errorMessage = 'Unable to reach payment server.';
    }
    else {
      errorMessage =
        error.error?.message ||
        error.error?.detail ||
        `Server Error: ${error.status}`;
    }

    console.error('Paystack Payment Service Error:', error);

    return throwError(() => new Error(errorMessage));
  }
}
