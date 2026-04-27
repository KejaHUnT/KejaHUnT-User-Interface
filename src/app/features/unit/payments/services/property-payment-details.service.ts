import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddGatewayConfigDto, ApiMessageResponse, GatewayConfigDetailsResponse } from '../models/payment-details.model';


@Injectable({
  providedIn: 'root'
})
export class PropertyPaymentDetailsService {

  constructor(private http: HttpClient) { }

  addGatewayConfig(dto: AddGatewayConfigDto): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${environment.paymentApiBaseUrl}/api/clients/gateways`,
      dto
    );
  }

  getGatewaysByAccountId(accountId: string): Observable<GatewayConfigDetailsResponse[]> {

    return this.http.get<any[]>(
      `${environment.paymentApiBaseUrl}/api/clients/gateways/${accountId}`
    ).pipe(
      map(response => response.map(item => ({
        accountId: item.accountId,
        gateway: item.gateway,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,

        config: JSON.parse(item.configJson)
      }))),
      catchError(this.handleError.bind(this))
    );

  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }

}