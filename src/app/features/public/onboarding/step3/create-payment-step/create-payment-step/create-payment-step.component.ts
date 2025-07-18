import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from 'src/app/features/unit/payments/services/payment.service';
import { PaymentDetails } from 'src/app/features/unit/payments/models/payment-details.model';

@Component({
  selector: 'app-payment-step',
  templateUrl: './create-payment-step.component.html',
  styleUrls: ['./create-payment-step.component.css']
})
export class PaymentStepComponent implements OnInit {
  @Input() unitId!: number;
  @Input() amount!: number;

  form!: FormGroup;
  tenantId!: number;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      this.tenantId = +storedTenantId;
    }

    this.form = this.fb.group({
      unitId: [{ value: this.unitId, disabled: true }],
      tenantId: [{ value: this.tenantId, disabled: true }],
      amount: [this.amount, [Validators.required, Validators.min(1)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^07\\d{8}$')]]
    });
  }

  submitPayment(): void {
    if (this.form.invalid || !this.unitId || !this.tenantId) {
      this.errorMessage = 'Invalid payment details.';
      return;
    }

    this.isSubmitting = true;

    const paymentData: PaymentDetails = {
      unitId: this.unitId,
      tenantId: this.tenantId,
      amount: this.form.getRawValue().unitRent, // editable
      phoneNumber: this.form.value.phoneNumber,
      timestamp: new Date()
    };

    this.paymentService.createPayment(paymentData).subscribe({
      next: () => {
        this.successMessage = 'Payment created successfully.';
        this.errorMessage = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = 'Payment failed. Please try again.';
        this.successMessage = '';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}
