import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateUnitRequest } from '../../property/models/create-unit-request.model';
import { Unit } from '../../property/models/unit.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  constructor(private http: HttpClient) { }

  createUnit(formData: FormData): Observable<Unit> {
    return this.http.post<Unit>(`${environment.apiBaseUrl}/api/Unit`, formData);
  }

  getAllUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${environment.apiBaseUrl}/api/Unit`);
  }

  getUnitById(id: string): Observable<Unit> {
    return this.http.get<Unit>(`${environment.apiBaseUrl}/api/Unit/${id}`);
  }

  updateProperty(id: string, formData: FormData): Observable<Unit> {
    return this.http.put<Unit>(`${environment.apiBaseUrl}/api/Unit/${id}`, formData);
  }

  deleteProperty(id: string): Observable<Unit> {
    return this.http.delete<Unit>(`${environment.apiBaseUrl}/api/Unit/${id}`);
  }
}
