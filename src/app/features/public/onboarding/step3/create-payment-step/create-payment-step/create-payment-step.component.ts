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

@Component({
  selector: 'app-payment-step',
  templateUrl: './create-payment-step.component.html',
  styleUrls: ['./create-payment-step.component.css']
})
export class PaymentStepComponent implements OnInit, OnChanges {

  @Input('amount') paymentAmount!: number;

  @Input() unitId!: number;

  form!: FormGroup;
  tenantId!: number;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedTenantId = localStorage.getItem('tenantId');
    this.tenantId = storedTenantId ? Number(storedTenantId) : 0;

    this.form = this.fb.group({
      tenantId: [{ value: this.tenantId, disabled: true }],
      unitId: [{ value: this.unitId, disabled: true }],
      amount: [this.paymentAmount, [Validators.required, Validators.min(1)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^07\\d{8}$')]
      ]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paymentAmount'] && this.form) {
      this.form.patchValue({ amount: this.paymentAmount });
    }

    if (changes['unitId'] && this.form) {
      this.form.patchValue({ unitId: this.unitId });
    }
  }

  submitPayment(): void {
    if (this.form.invalid || !this.unitId || !this.tenantId) {
      this.errorMessage = 'Invalid payment details.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const paymentData: PaymentDetails = {
      unitId: this.unitId,
      tenantId: this.tenantId,
      amount: this.form.getRawValue().amount,
      phoneNumber: this.form.value.phoneNumber,
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
