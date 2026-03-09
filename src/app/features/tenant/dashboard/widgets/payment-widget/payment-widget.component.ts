import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Tenant } from '../../../models/tenant.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { PaystackPaymentService } from 'src/app/features/unit/payments/services/paystack-payment.ts.service';
import { InitializePaymentRequest, InitializePaymentResponse, PaymentMethod } from 'src/app/features/unit/payments/models/paystack-models';

@Component({
  selector: 'app-payment-widget',
  templateUrl: './payment-widget.component.html',
  styleUrls: ['./payment-widget.component.css']
})
export class PaymentWidgetComponent implements OnInit {
  @Input() tenant!: Tenant;
  @Input() unitDetails!: Unit;
  @Input() propertyDetails?: Property;

  // **Output for parent to listen to modal close**
  @Output() close = new EventEmitter<void>();

  paymentForm!: FormGroup;
  isSubmittingPayment = false;
  paymentErrorMessage = '';
  paymentSuccessMessage = '';

  allMonths = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' })
  }));

  constructor(private fb: FormBuilder, private paystackService: PaystackPaymentService) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      months: this.fb.array([])
    });

    this.addMonth();
  }

  get monthsControls() {
    return (this.paymentForm.get('months') as FormArray).controls;
  }

  addMonth() {
    const monthsArray = this.paymentForm.get('months') as FormArray;
    monthsArray.push(
      this.fb.group({
        month: ['', Validators.required],
        year: [new Date().getFullYear(), Validators.required],
        amount: [this.unitDetails?.price ?? 0, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeMonth(index: number) {
    const monthsArray = this.paymentForm.get('months') as FormArray;
    if (monthsArray.length === 1) {
      this.paymentErrorMessage = 'At least one month is required.';
      return;
    }
    monthsArray.removeAt(index);
  }

  get totalAmount(): number {
    const monthsArray = this.paymentForm.get('months') as FormArray;
    return monthsArray.controls.reduce((sum, control) => sum + Number(control.value.amount || 0), 0);
  }

  submitPayment() {
    if (!this.tenant || !this.unitDetails || this.paymentForm.invalid) {
      this.paymentErrorMessage = 'Complete all fields';
      return;
    }

    this.isSubmittingPayment = true;
    const firstMonth = (this.paymentForm.get('months') as FormArray).at(0).value;

    const request: InitializePaymentRequest = {
      unitId: this.unitDetails.id ?? 0,
      propertyId: this.propertyDetails?.id ?? 0,
      userEmail: this.tenant.email ?? '',
      amount: this.totalAmount ?? 0,
      currency: 'KES',
      periodMonth: Number(firstMonth.month),
      periodYear: Number(firstMonth.year),
      paymentMethod: PaymentMethod.STK_PUSH
    };

    this.paystackService.initializePayment(request).subscribe({
      next: (res: InitializePaymentResponse) => {
        this.isSubmittingPayment = false;
        if (res.authorizationUrl) window.location.href = res.authorizationUrl;
        else this.paymentSuccessMessage = 'Payment initialized successfully.';
      },
      error: err => {
        this.isSubmittingPayment = false;
        this.paymentErrorMessage = err?.message || 'Payment failed.';
      }
    });
  }

  /** ---------------- Modal Controls ---------------- */
  closeModal() {
    this.close.emit(); // Notify parent to close modal
  }
}
