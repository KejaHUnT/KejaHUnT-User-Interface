import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddGatewayConfigDto } from '../../models/payment-details.model';
import { PropertyPaymentDetailsService } from '../../services/property-payment-details.service';
import { environment } from 'src/environments/environment'; // ✅ IMPORT ENV

interface GatewayOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-property-payment-modal',
  templateUrl: './property-payment-modal.component.html',
  styleUrls: ['./property-payment-modal.component.css']
})
export class PropertyPaymentModalComponent implements OnChanges {

  @Input() isOpen: boolean = false;
  @Input() propertyId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showSecret = false;

  readonly gateways: GatewayOption[] = [
    { label: 'Paystack',  value: 'Paystack',  icon: '💳' },
    { label: 'M-Pesa',    value: 'Mpesa',     icon: '📱' },
    { label: 'Stripe',    value: 'Stripe',    icon: '⚡' },
  ];

  constructor(
    private fb: FormBuilder,
    private service: PropertyPaymentDetailsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.initForm();
      this.error = null;
      this.success = null;
      this.showSecret = false;
    }
  }

  initForm(): void {

    const generatedAccountId = `KejaHunT-${this.propertyId}`;
    const callbackUrl = environment.paymentCallbackUrl;

    this.form = this.fb.group({
      gateway:            ['', Validators.required],

      // ✅ AUTO FILLED (NO VALIDATOR NEEDED)
      accountId:          [{ value: generatedAccountId, disabled: true }],
      callbackUrl:        [{ value: callbackUrl, disabled: true }],

      // ✅ USER INPUT
      paystackPublicKey:  ['', Validators.required],
      paystackSecretKey:  ['', Validators.required],
    });
  }

  /** Convenience helper used in template */
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  /** Close when clicking the backdrop */
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // ✅ GET DISABLED VALUES USING getRawValue()
    const formValue = this.form.getRawValue();

    const configObject = {
      PublicKey:   formValue.paystackPublicKey,
      SecretKey:   formValue.paystackSecretKey,
      CallbackUrl: formValue.callbackUrl,
    };

    const dto: AddGatewayConfigDto = {
      accountId:  formValue.accountId, // ✅ AUTO
      gateway:    formValue.gateway,
      configJson: JSON.stringify(configObject),
    };

    this.service.addGatewayConfig(dto).subscribe({
      next: (res) => {
        this.success = res.message ?? 'Gateway configured successfully.';
        this.loading = false;
        this.saved.emit();

        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to save gateway. Please try again.';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}