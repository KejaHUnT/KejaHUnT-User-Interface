import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddPropertyRequest } from '../models/add-property-request.model';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model';
import { environment } from 'src/environments/environment';
import { UpdatePropertyRequest } from '../models/update-property-request.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  constructor(private http: HttpClient) { }

  createProperty(data: AddPropertyRequest) : Observable<Property> {
    return this.http.post<Property>(`${environment.apiBaseUrl}/api/property`, data);
}

getAllProperties() : Observable<Property[]> {
  return this.http.get<Property[]>(`${environment.apiBaseUrl}/api/property`);
}

getPopertyById(id: string) : Observable<Property> {
  return this.http.get<Property>(`${environment.apiBaseUrl}/api/property/${id}`);
}

updateProperty(id: string, data: UpdatePropertyRequest): Observable<Property> {
  return this.http.put<Property>(`${environment.apiBaseUrl}/api/property/${id}`, data);
}

deleteProperty(id: string): Observable<Property> {
  return this.http.delete<Property>(`${environment.apiBaseUrl}/api/property/${id}`);
}


}
