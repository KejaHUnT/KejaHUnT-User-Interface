import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginRequest } from '../../models/login-request.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoginMode = true;

  loginModel: LoginRequest = {
    email: '',
    password: ''
  };

  registerModel: LoginRequest = {
    email: '',
    password: ''
  };

  returnUrl: string = '/';

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  onLoginSubmit(): void {
    this.authService.login(this.loginModel).subscribe({
      next: (response) => {
        this.cookieService.set(
          'Authorization',
          response.token,
          undefined,
          '/',
          undefined,
          true,
          'Strict'
        );

        this.authService.setUser({
          email: response.email,
          roles: response.roles
        });

        this.router.navigateByUrl(this.returnUrl); // Use returnUrl from query params
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid credentials. Please try again.');
      }
    });
  }

  onRegisterSubmit(): void {
    this.authService.register(this.registerModel).subscribe({
      next: () => {
        alert('Registration successful! You can now log in.');
        this.isLoginMode = true;
      },
      error: (err) => {
        console.error('Registration failed:', err);
        alert('Failed to register. Please try again.');
      }
    });
  }
}
