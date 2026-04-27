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

  // Mode
  isLoginMode = true;

  // UI State
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Input UI states
  emailFocused = false;
  passwordFocused = false;
  showPassword = false;

  // Models
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
    this.route.url.subscribe(segments => {
      const currentPath = segments.map(s => s.path).join('/');
      this.isLoginMode = currentPath === 'signin';

      this.route.queryParams.subscribe(params => {
        this.returnUrl = params['returnUrl'] || '/';
      });
    });
  }

  // Dynamic model binding (used in template)
  get model(): LoginRequest {
    return this.isLoginMode ? this.loginModel : this.registerModel;
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;

    // Reset messages when switching
    this.errorMessage = null;
    this.successMessage = null;

    const targetRoute = this.isLoginMode ? '/signin' : '/register';

    this.router.navigate([targetRoute], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }

  onLoginSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

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

        this.successMessage = 'Login successful! Redirecting...';

        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl);
        }, 800);
      },
      error: (err) => {
        console.error('Login failed:', err);

        this.errorMessage = 'Invalid email or password. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onRegisterSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.register(this.registerModel).subscribe({
      next: () => {

        this.successMessage = 'Account created successfully! You can now sign in.';

        // Switch to login after short delay
        setTimeout(() => {
          this.isLoginMode = true;
          this.router.navigate(['/signin'], {
            queryParams: { returnUrl: this.returnUrl }
          });
        }, 1000);
      },
      error: (err) => {
        console.error('Registration failed:', err);

        this.errorMessage = 'Failed to create account. Try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}