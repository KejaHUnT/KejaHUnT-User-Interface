import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddPropertyRequest } from '../models/add-property-request.model';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model';
import { environment } from 'src/environments/environment';
import { UpdatePropertyRequest } from '../models/update-property-request.model';
import { GeneralFeatures } from '../models/general-feature.model';
import { IndoorFeature } from '../models/indoor-feature.model';
import { outdoorFeature } from '../models/outdoor-feature.model';
import { Policy } from '../models/policy.model';
import { AddPolicyDescription } from '../models/add-policy-description.model';
import { UpdatePolicyDescription } from '../models/update-policy-description.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  constructor(private http: HttpClient) { }
  createProperty(formData: FormData): Observable<Property> {
    return this.http.post<Property>(`${environment.apiBaseUrl}/api/property`, formData);
  }

  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${environment.apiBaseUrl}/api/property`);
  }

  getPopertyById(id: string): Observable<Property> {
    return this.http.get<Property>(`${environment.apiBaseUrl}/api/property/${id}`);
  }

  updateProperty(id: string, formData: FormData): Observable<UpdatePropertyRequest> {
    return this.http.put<UpdatePropertyRequest>(`${environment.apiBaseUrl}/api/property/${id}`, formData);
  }

  deleteProperty(id: string): Observable<Property> {
    return this.http.delete<Property>(`${environment.apiBaseUrl}/api/property/${id}`);
  }

  getAllFeatures(): Observable<GeneralFeatures[]> {
    return this.http.get<GeneralFeatures[]>(`${environment.apiBaseUrl}/api/feature/general`);
  }

  getAllIndoorFeatures(): Observable<IndoorFeature[]> {
    return this.http.get<IndoorFeature[]>(`${environment.apiBaseUrl}/api/feature/indoor`);
  }

  getAllOutdorrFeatures(): Observable<outdoorFeature[]> {
    return this.http.get<outdoorFeature[]>(`${environment.apiBaseUrl}/api/feature/outdoor`);
  }

  getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${environment.apiBaseUrl}/api/feature/amenities`);
  }

  addPolicyDescription(model: AddPolicyDescription): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/api/feature/policy`, model);
  }

  updatePolicyDescription(id: string, model: UpdatePolicyDescription): Observable<void> {
    return this.http.put<void>(`${environment.apiBaseUrl}/api/feature/description`, model);
  }

}
