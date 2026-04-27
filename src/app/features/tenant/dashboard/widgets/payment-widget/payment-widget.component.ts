import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Tenant } from '../../../models/tenant.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';

import { PaymentServiceService } from 'src/app/features/unit/payments/services/payment-service.service';
import { CreateUnitPaymentsDto, PaymentGateway } from 'src/app/features/unit/payments/models/payment.model';

import { PropertyPaymentDetailsService } from 'src/app/features/unit/payments/services/property-payment-details.service';
import { GatewayConfigDetailsResponse } from 'src/app/features/unit/payments/models/payment-details.model';

@Component({
  selector: 'app-payment-widget',
  templateUrl: './payment-widget.component.html',
  styleUrls: ['./payment-widget.component.css']
})
export class PaymentWidgetComponent implements OnInit, OnDestroy {

  @Input() tenant!: Tenant;
  @Input() unitDetails!: Unit;
  @Input() propertyDetails?: Property;

  @Output() close = new EventEmitter<void>();

  paymentForm!: FormGroup;
  isSubmittingPayment = false;
  paymentErrorMessage = '';
  paymentSuccessMessage = '';

  gateways: GatewayConfigDetailsResponse[] = [];
  selectedGatewayConfig?: GatewayConfigDetailsResponse;

  readonly allMonths = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' })
  }));

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentServiceService,
    private gatewayService: PropertyPaymentDetailsService
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      //  Auto-fill from tenant and disable editing
      phoneNumber: [
        { value: this.tenant?.phoneNumber || '', disabled: true },
        [Validators.required, Validators.pattern('^07\\d{8}$')]
      ],
      months: this.fb.array([])
    });

    this.addMonth();
    this.loadGatewayConfig();
  }

  // ── Helpers ──────────────────────────────────────────────

  get monthsArray(): FormArray {
    return this.paymentForm.get('months') as FormArray;
  }

  get monthsControls() {
    return this.monthsArray.controls;
  }

  get totalAmount(): number {
    return this.monthsArray.controls.reduce(
      (sum, ctrl) => sum + Number(ctrl.value.amount || 0),
      0
    );
  }

  // ── Gateway loading ───────────────────────────────────────

  private loadGatewayConfig(): void {
    if (!this.propertyDetails?.id) {
      this.paymentErrorMessage = 'Property information is missing.';
      return;
    }

    const accountId = `KejaHunT-${this.propertyDetails.id}`;

    const sub = this.gatewayService.getGatewaysByAccountId(accountId).subscribe({
      next: (gateways: GatewayConfigDetailsResponse[]) => {
        this.gateways = gateways;

        this.selectedGatewayConfig =
          gateways.find(g => g.isActive) ?? gateways[0];

        if (!this.selectedGatewayConfig) {
          this.paymentErrorMessage =
            'No payment gateway is configured for this property.';
        }
      },
      error: () => {
        this.paymentErrorMessage =
          'Failed to load payment configuration. Please try again.';
      }
    });

    this.subs.add(sub);
  }

  // ── Month FormArray helpers ───────────────────────────────

  addMonth(): void {
  const rent = this.unitDetails?.price ?? 0;

  this.monthsArray.push(
    this.fb.group({
      month: ['', Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      expectedAmount: [{ value: rent, disabled: true }],
      amount: [
        rent, // default = full rent
        [Validators.required, Validators.min(1)]
      ]
    })
  );
}

  removeMonth(index: number): void {
    if (this.monthsArray.length === 1) {
      this.paymentErrorMessage = 'At least one payment month is required.';
      return;
    }
    this.monthsArray.removeAt(index);
    this.paymentErrorMessage = '';
  }

  get expectedTotal(): number {
  return this.monthsArray.controls.reduce(
    (sum, ctrl) =>
      sum + Number(ctrl.get('expectedAmount')?.value || 0),
    0
  );
}

  // ── Submit ────────────────────────────────────────────────

  submitPayment(): void {
    this.paymentForm.markAllAsTouched();

    if (!this.tenant || !this.unitDetails) {
      this.paymentErrorMessage = 'Tenant or unit details are missing.';
      return;
    }

    if (!this.selectedGatewayConfig) {
      this.paymentErrorMessage =
        'No payment gateway configured. Contact the property manager.';
      return;
    }

    if (this.paymentForm.invalid) return;

    this.isSubmittingPayment = true;
    this.paymentErrorMessage = '';
    this.paymentSuccessMessage = '';

    const firstMonth = this.monthsArray.at(0).value;

    const dto: CreateUnitPaymentsDto = {
      unitId: this.unitDetails.id ?? 0,
      propertyId: this.propertyDetails?.id ?? 0,
      tenantId: this.tenant.id ?? 0,
      userEmail: this.tenant.email ?? '',

      //  ALWAYS use tenant phone number
      phoneNumber: this.tenant.phoneNumber,

      amount: this.totalAmount,
      currency: 'KES',
      periodMonth: Number(firstMonth.month),
      periodYear: Number(firstMonth.year),
      gateway: this.selectedGatewayConfig.gateway as PaymentGateway,
      accountId: this.selectedGatewayConfig.accountId,
    };

    const sub = this.paymentService.initializePayment(dto).subscribe({
      next: (res) => {
        this.isSubmittingPayment = false;
        this.paymentSuccessMessage =
          res.reference || 'Payment initialized successfully.';

        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
        }
      },
      error: (err) => {
        this.isSubmittingPayment = false;
        this.paymentErrorMessage =
          err?.error?.message || err?.message || 'Payment failed. Please try again.';
      }
    });

    this.subs.add(sub);
  }

  // ── Close ─────────────────────────────────────────────────

  closeModal(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}