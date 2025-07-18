import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddTenantRequest } from '../models/add-tenant-request.model';
import { Observable } from 'rxjs';
import { Tenant } from '../models/tenant.model';
import { environment } from 'src/environments/environment';
import { UpdateTenantRequest } from '../models/update-tenant-request.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  constructor(private http: HttpClient) { }

  createTenant(data: AddTenantRequest): Observable<Tenant> {
    return this.http.post<Tenant>(`${environment.tenantApiBaseUrl}/api/tenant`, data);
  }

  getAllTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${environment.tenantApiBaseUrl}/api/tenant`);
  }

  getTenantById(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${environment.tenantApiBaseUrl}/api/tenant/${id}`);
  }

  getTenantByEmail(email: string): Observable<Tenant> {
  return this.http.get<Tenant>(`${environment.tenantApiBaseUrl}/api/tenant/${email}`);
}

  updateTenant(id: string, data: UpdateTenantRequest): Observable<Tenant> {
    return this.http.put<Tenant>(`${environment.tenantApiBaseUrl}/api/tenant/${id}`, data);
  }

  deleteTenant(id: string): Observable<Tenant> {
    return this.http.delete<Tenant>(`${environment.tenantApiBaseUrl}/api/tenant/${id}`);
  }

}
