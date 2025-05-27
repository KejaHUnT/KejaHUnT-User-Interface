import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  getPaymentByUnitId(unitId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${environment.paymentApiBaseUrl}/api/PaymentInfo/payment/${unitId}`);
  }
}
