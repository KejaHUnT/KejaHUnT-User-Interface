import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

// MODELS
import { 
  CreateUnitPaymentsDto, 
  InitializePaymentResponse,
  UnitPaymentsDto,
  UpdateUnitPaymentsDto
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentServiceService {

  private baseUrl = `${environment.apiBaseUrl}/api/UnitPayments`;

  constructor(private http: HttpClient) { }

  // =====================================================
  // INITIALIZE PAYMENT
  // =====================================================
  initializePayment(dto: CreateUnitPaymentsDto): Observable<InitializePaymentResponse['data']> {
    return this.http.post<InitializePaymentResponse>(
      `${this.baseUrl}/initialize`,
      dto
    ).pipe(
      map(res => {
        if (!res.success) {
          throw new Error(res.message || 'Payment initialization failed');
        }
        return res.data;
      })
    );
  }

  // =====================================================
  // GET ALL PAYMENTS
  // =====================================================
  getAll(): Observable<UnitPaymentsDto[]> {
    return this.http.get<any>(`${this.baseUrl}`)
      .pipe(
        map(res => res.data)
      );
  }

  // =====================================================
  // GET PAYMENT BY ID
  // =====================================================
  getById(id: number): Observable<UnitPaymentsDto> {
    return this.http.get<any>(`${this.baseUrl}/${id}`)
      .pipe(
        map(res => res.data)
      );
  }

  // =====================================================
  // GET PAYMENTS BY TENANT
  // =====================================================
  getByTenant(tenantId: number): Observable<UnitPaymentsDto[]> {
    return this.http.get<any>(`${this.baseUrl}/tenant/${tenantId}`)
      .pipe(
        map(res => res.data)
      );
  }

  // =====================================================
  // GET PAYMENTS BY UNIT
  // =====================================================
  getByUnit(unitId: number): Observable<UnitPaymentsDto[]> {
    return this.http.get<any>(`${this.baseUrl}/unit/${unitId}`)
      .pipe(
        map(res => res.data)
      );
  }

  // =====================================================
  // UPDATE PAYMENT
  // =====================================================
  update(id: number, dto: UpdateUnitPaymentsDto): Observable<UnitPaymentsDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto)
      .pipe(
        map(res => {
          if (!res.success) {
            throw new Error(res.message || 'Update failed');
          }
          return res.data;
        })
      );
  }

  // =====================================================
  // DELETE PAYMENT
  // =====================================================
  delete(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`)
      .pipe(
        map(res => {
          if (!res.success) {
            throw new Error(res.message || 'Delete failed');
          }
          return true;
        })
      );
  }

  // =====================================================
  // WEBHOOK (CALLBACK SIMULATION / TESTING)
  // =====================================================
  webhook(reference: string, status: string): Observable<boolean> {
    return this.http.post<any>(
      `${this.baseUrl}/webhook?reference=${reference}&status=${status}`,
      {}
    ).pipe(
      map(res => {
        if (!res.success) {
          throw new Error(res.message || 'Webhook failed');
        }
        return true;
      })
    );
  }
}