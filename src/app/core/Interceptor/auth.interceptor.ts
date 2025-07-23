import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldInterceptRequest(request)) {
      const token = this.cookieService.get('Authorization');
      if (token) {
        const authRequest = request.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`
          }
        });
        return next.handle(authRequest);
      }
    }
    return next.handle(request);
  }

  private shouldInterceptRequest(request: HttpRequest<any>): boolean {
    // If URL params contain addAuth=false, skip adding token
    const urlParams = new URLSearchParams(request.urlWithParams.split('?')[1]);
    return urlParams.get('addAuth') !== 'false';
  }
}
