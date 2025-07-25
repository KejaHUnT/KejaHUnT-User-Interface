import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { LoginResponse } from '../models/login-response.model';
import { LoginRequest } from '../models/login-request.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly $user = new BehaviorSubject<User | undefined>(undefined);

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const user = this.getUser();
    if (user) {
      this.$user.next(user);
    }
  }

  register(request: LoginRequest): Observable<void> {
    const params = new HttpParams().set('addAuth', 'false');

    return this.http.post<void>(`${environment.accessApiBaseUrl}/api/Auth/register`, {
      email: request.email,
      password: request.password
    }, { params });
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    const params = new HttpParams().set('addAuth', 'false');

    return this.http.post<LoginResponse>(`${environment.accessApiBaseUrl}/api/Auth/login`, {
      email: request.email,
      password: request.password
    }, { params }).pipe(
      tap((response: LoginResponse) => {
        if (response?.token) {
          this.setAuthenticationData(response);
        }
      }),
      take(1) // Expect only one emission
    );
  }

  private setAuthenticationData(response: LoginResponse): void {
    this.setAuthToken(response.token);
    this.setUser({
      email: response.email,
      roles: response.roles
    });
  }

  private setAuthToken(token: string): void {
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    this.cookieService.set('Authorization', cleanToken, undefined, '/', '', true, 'Strict');
  }

  setUser(user: User): void {
    this.$user.next(user);
    this.storeUserInLocalStorage(user);
  }

  private storeUserInLocalStorage(user: User): void {
    try {
      localStorage.setItem('user-email', user.email);
      localStorage.setItem('user-roles', user.roles.join(','));
    } catch (error) {
      console.error('Failed to store user data in localStorage:', error);
    }
  }

  user(): Observable<User | undefined> {
    return this.$user.asObservable();
  }

  getUser(): User | undefined {
    try {
      const email = localStorage.getItem('user-email');
      const roles = localStorage.getItem('user-roles');
      if (email && roles) {
        return {
          email,
          roles: roles.split(',').filter(role => role.trim())
        };
      }
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
    }
    return undefined;
  }

  getToken(): string | null {
    try {
      return this.cookieService.get('Authorization') || null;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getUser());
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isTenant(): boolean {
    return this.hasRole('Tenant');
  }

  getLoggedInUserEmail(): string | null {
    return this.getUser()?.email || null;
  }
  
  logout(): void {
    try {
      localStorage.clear();
      this.cookieService.delete('Authorization', '/');
      this.$user.next(undefined);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
