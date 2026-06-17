import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PaymentServiceService } from 'src/app/features/unit/payments/services/payment-service.service';
import { CreateUnitPaymentsDto, PaymentGateway } from 'src/app/features/unit/payments/models/payment.model';

import { PropertyPaymentDetailsService } from 'src/app/features/unit/payments/services/property-payment-details.service';
import { GatewayConfigDetailsResponse } from 'src/app/features/unit/payments/models/payment-details.model';

import { TenantFlowService } from 'src/app/features/tenant/services/tenant-flow.service';

@Component({
  selector: 'app-payment-step',
  templateUrl: './create-payment-step.component.html',
  styleUrls: ['./create-payment-step.component.css']
})
export class PaymentStepComponent implements OnInit, OnChanges, OnDestroy {

  @Input() paymentAmount!: number;
  @Input() unitId!: number;
  @Input() propertyId!: number;

  form!: FormGroup;
  tenantId!: number;
  tenantEmail = '';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Gateway resolved from the property — same pattern as the widget
  selectedGatewayConfig?: GatewayConfigDetailsResponse;
  gatewayLoading = false;

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentServiceService,
    private gatewayService: PropertyPaymentDetailsService,
    private tenantFlowService: TenantFlowService,
    private router: Router
  ) {}

  // ── Init ─────────────────────────────────────────────────

  ngOnInit(): void {
    this.form = this.fb.group({
      tenantId:    [{ value: null, disabled: true }],
      unitId:      [{ value: null, disabled: true }],
      amount:      [{ value: null, disabled: true }],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^07\\d{8}$')
      ]]
    });

    // Hydrate from TenantFlowService — same source of truth as the rest of the stepper
    const tenantSub = this.tenantFlowService.tenant$.subscribe(tenant => {
      if (!tenant) return;

      this.tenantId    = tenant.id;
      this.tenantEmail = tenant.email ?? '';
      this.errorMessage = '';

      this.form.patchValue({
        tenantId:    tenant.id,
        unitId:      this.unitId        ?? null,
        amount:      this.paymentAmount ?? null,
        phoneNumber: tenant.phoneNumber ?? ''
      });

      this.form.get('phoneNumber')?.enable();
    });

    this.subs.add(tenantSub);

    // Load the property's active gateway — same accountId convention as the widget
    this.loadGatewayConfig();
  }

  // ── Input changes ─────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) return;

    if (changes['unitId']?.currentValue != null) {
      this.form.patchValue({ unitId: this.unitId });
    }

    if (changes['paymentAmount']?.currentValue != null) {
      this.form.patchValue({ amount: this.paymentAmount });
    }

    // Re-fetch gateway if propertyId arrives late (stepper flow)
    if (changes['propertyId']?.currentValue && !changes['propertyId'].firstChange) {
      this.loadGatewayConfig();
    }
  }

  // ── Gateway loading (mirrors widget logic exactly) ────────

  private loadGatewayConfig(): void {
    if (!this.propertyId) return;

    this.gatewayLoading = true;

    // Same accountId convention: KejaHunT-{propertyId}
    const accountId = `KejaHunT-${this.propertyId}`;

    const gatewaySub = this.gatewayService
      .getGatewaysByAccountId(accountId)
      .subscribe({
        next: (gateways: GatewayConfigDetailsResponse[]) => {
          this.gatewayLoading = false;
          // Prefer active; fall back to first available
          this.selectedGatewayConfig =
            gateways.find(g => g.isActive) ?? gateways[0];

          if (!this.selectedGatewayConfig) {
            this.errorMessage =
              'No payment gateway configured for this property.';
          }
        },
        error: () => {
          this.gatewayLoading = false;
          this.errorMessage =
            'Failed to load payment configuration. Please try again.';
        }
      });

    this.subs.add(gatewaySub);
  }

  // ── Submit (same DTO shape as the widget) ─────────────────

  submitPayment(): void {
    if (!this.tenantId) {
      this.errorMessage = 'Tenant details are missing. Please go back to Step 1.';
      return;
    }

    if (!this.unitId) {
      this.errorMessage = 'Unit information is missing. Please restart the flow.';
      return;
    }

    if (!this.selectedGatewayConfig) {
      this.errorMessage =
        'No payment gateway configured. Contact the property manager.';
      return;
    }

    this.form.get('phoneNumber')?.markAsTouched();
    if (this.form.get('phoneNumber')?.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // DTO matches CreateUnitPaymentsDto exactly — gateway + accountId
    // come from the resolved config, not user input
    const dto: CreateUnitPaymentsDto = {
      tenantId:    this.tenantId,
      unitId:      this.unitId,
      propertyId:  this.propertyId   ?? 0,
      userEmail:   this.tenantEmail,
      phoneNumber: this.form.get('phoneNumber')!.value,
      amount:      this.paymentAmount,
      currency:    'KES',
      periodMonth: new Date().getMonth() + 1,
      periodYear:  new Date().getFullYear(),
      gateway:     this.selectedGatewayConfig.gateway as PaymentGateway,
      accountId:   this.selectedGatewayConfig.accountId
    };

    const paymentSub = this.paymentService.initializePayment(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.reference || 'Payment initiated successfully.';

        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
          return;
        }

        setTimeout(() => {
          this.router.navigate(['/portal/tenant', this.tenantId]);
        }, 1800);
      },
      error: (err) => {
        console.error('Payment error:', err);
        this.errorMessage =
          err?.error?.message || err?.message ||
          'Payment initiation failed. Please try again.';
        this.isSubmitting = false;
      }
    });

    this.subs.add(paymentSub);
  }

  // ── Cleanup ───────────────────────────────────────────────

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}