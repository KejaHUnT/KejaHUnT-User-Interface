import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { PropertyService } from '../../property/services/property.service';
import { TenantService } from '../services/tenant.service';
import { Property } from '../../property/models/property.model';
import { Unit } from '../../property/models/unit.model';

@Component({
  selector: 'app-onboard-tenant',
  templateUrl: './onboard-tenant.component.html',
  styleUrls: ['./onboard-tenant.component.css']
})
export class OnboardTenantComponent implements OnInit {
  form!: FormGroup;
  properties: Property[] = [];
  availableUnits: Unit[] = [];
  isSubmitting = false;
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private propertyService: PropertyService,
    private tenantService: TenantService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const email = this.authService.getLoggedInUserEmail() || '';

    this.form = this.fb.group({
      email: [{ value: email, disabled: true }],
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      idNo: ['', Validators.required],
      employer: [''],
      propertyId: ['', Validators.required],
      unitId: ['', Validators.required],
    });

    this.propertyService.getAllProperties().subscribe({
      next: (properties) => this.properties = properties,
      error: (err) => console.error('Failed to load properties', err)
    });

    this.form.get('propertyId')?.valueChanges.subscribe(propertyId => {
      const selected = this.properties.find(p => p.id === +propertyId);
      this.availableUnits = selected?.units.filter(u => u.status === 'Available') || [];
      this.form.get('unitId')?.setValue('');
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const email = this.authService.getLoggedInUserEmail() || '';

    const payload = {
      ...this.form.getRawValue(),
      email,
      createdBy: email,
      propertyId: +this.form.get('propertyId')?.value,
      unitId: +this.form.get('unitId')?.value,
    };

    this.tenantService.createTenant(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted = true;
      },
      error: (err) => {
        console.error('Onboarding failed', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.error || 'Submission failed. Please try again.';
      }
    });
  }

  // ADD THIS METHOD
  goHome(): void {
    this.router.navigate(['/']);
  }
}