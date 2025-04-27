import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FileResponse } from '../models/file-response.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }

  getFileByDocumentId(documentId: string): Observable<FileResponse> {
    return this.http.get<FileResponse>(`${environment.fileHandlerApiBaseUrl}/api/File/${documentId}`);
  }
  

}
