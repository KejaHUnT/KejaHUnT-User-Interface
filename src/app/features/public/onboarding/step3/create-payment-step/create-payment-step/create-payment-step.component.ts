// src/app/features/unit/payments/components/create-payment-step.component.ts
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from 'src/app/features/unit/payments/services/payment.service';
import { PaymentDetails } from 'src/app/features/unit/payments/models/payment-details.model';
import { TenantFlowService } from 'src/app/features/tenant/services/tenant-flow.service';

@Component({
  selector: 'app-payment-step',
  templateUrl: './create-payment-step.component.html',
  styleUrls: ['./create-payment-step.component.css']
})
export class PaymentStepComponent implements OnInit, OnChanges {

  @Input() paymentAmount!: number;
  @Input() unitId!: number;

  form!: FormGroup;
  tenantId!: number;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router,
    private tenantFlowService: TenantFlowService
  ) {}

  ngOnInit(): void {
    // ✅ ALWAYS create the form (stepper-safe)
    this.form = this.fb.group({
      tenantId: [{ value: null, disabled: true }],
      unitId: [{ value: null, disabled: true }],
      amount: [{ value: null, disabled: true }],
      phoneNumber: ['', [Validators.required, Validators.pattern('^07\\d{8}$')]]
    });

    // Subscribe to tenant updates
    this.tenantFlowService.tenant$.subscribe(tenant => {
      if (!tenant) {
        this.errorMessage = 'Please complete tenant details first.';
        this.form.disable();
        return;
      }

      this.tenantId = tenant.id;

      // Patch the form values
      this.form.patchValue({
        tenantId: tenant.id,
        unitId: this.unitId || null,
        amount: this.paymentAmount || null,
        phoneNumber: tenant.phoneNumber || ''
      });

      this.form.enable(); // Only phoneNumber is editable
      this.form.get('tenantId')?.disable();
      this.form.get('unitId')?.disable();
      this.form.get('amount')?.disable();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) return;

    // Patch amount and unitId if inputs change
    if (changes['unitId'] && this.unitId != null) {
      this.form.patchValue({ unitId: this.unitId });
    }

    if (changes['paymentAmount'] && this.paymentAmount != null) {
      this.form.patchValue({ amount: this.paymentAmount });
    }
  }

  submitPayment(): void {
    if (this.form.invalid || !this.tenantId || !this.unitId) {
      this.errorMessage = 'Invalid payment details.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const paymentData: PaymentDetails = {
      tenantId: this.tenantId,
      unitId: this.unitId,
      amount: this.paymentAmount,
      phoneNumber: this.form.get('phoneNumber')!.value,
      timestamp: new Date()
    };

    this.paymentService.createPayment(paymentData).subscribe({
      next: () => {
        this.successMessage = 'Payment created successfully.';
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/portal/tenant', this.tenantId]);
        }, 1200);
      },
      error: (err) => {
        this.errorMessage = 'Payment failed. Please try again.';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}
