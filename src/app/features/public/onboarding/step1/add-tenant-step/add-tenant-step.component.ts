import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { CreateUnitRequest } from 'src/app/features/property/models/create-unit-request.model';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';

@Component({
  selector: 'app-add-tenant-step',
  templateUrl: './add-tenant-step.component.html',
  styleUrls: ['./add-tenant-step.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddTenantStepComponent implements OnInit {
  @Input() unitId!: number;

  form!: FormGroup;
  selectedUnit?: CreateUnitRequest;
  tenantId?: number;
  loggedInUserEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService,
    private tenantService: TenantService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      idNo: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      employer: ['', Validators.required],
      unitId: [this.unitId]
    });

    const storedEmail = localStorage.getItem('user-email');
    if (storedEmail) {
      this.loggedInUserEmail = storedEmail;
      this.form.patchValue({ email: storedEmail });
      this.refreshTenantDetails();
    }

    if (this.unitId) {
      this.unitService.getUnitById(this.unitId.toString()).subscribe(unit => {
        this.selectedUnit = unit;
        this.form.patchValue({ unitId: this.unitId });
      });
    }
  }

  refreshTenantDetails(): void {
    if (!this.loggedInUserEmail) return;

    this.tenantService.getTenantByEmail(this.loggedInUserEmail).subscribe({
      next: tenant => {
        if (tenant) {
          this.tenantId = tenant.id;
          this.form.patchValue({
            fullName: tenant.fullName,
            phoneNumber: tenant.phoneNumber,
            idNo: tenant.idNo,
            email: tenant.email,
            employer: tenant.employer,
            unitId: tenant.unitId || this.unitId
          });
        }
        this.form.enable();
      },
      error: err => {
        console.warn('No tenant found for email:', this.loggedInUserEmail, err);
        this.form.reset();
        this.form.patchValue({ email: this.loggedInUserEmail, unitId: this.unitId });
        this.form.enable();
      }
    });
  }

  submitTenant(callback?: () => void): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.value,
      createdBy: this.loggedInUserEmail || 'System'
    };

    const afterSuccess = (tenant: any) => {
      this.tenantId = tenant.id;
      // Do NOT disable the form here permanently
      if (callback) callback();
    };

    if (this.tenantId) {
      this.tenantService.updateTenant(this.tenantId.toString(), payload).subscribe({
        next: () => afterSuccess({ id: this.tenantId }),
        error: err => console.error('Failed to update tenant', err)
      });
    } else {
      this.tenantService.createTenant(payload).subscribe({
        next: afterSuccess,
        error: err => console.error('Failed to create tenant', err)
      });
    }
  }

}
