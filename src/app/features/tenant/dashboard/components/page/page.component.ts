import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { Payment } from 'src/app/features/unit/payments/models/payment.model';

import { PaymentService } from 'src/app/features/unit/payments/services/payment.service';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { PropertyService } from 'src/app/features/property/services/property.service';

import { Tenant } from '../../../models/tenant.model';
import { TenantService } from '../../../services/tenant.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnDestroy {

  tenantId!: string;
  unitId!: string;

  tenant?: Tenant;
  unitDetails!: Unit;
  propertyDetails?: Property;
  payments: Payment[] = [];

  totalPaid = 0;
  overdueBalance: number | null = null;

  greetingMessage = '';
  showPropertyDetails = false;

  // Modal controls
  showPaymentModal = false;

  routeSubscription?: Subscription;
  tenantSubscription?: Subscription;
  unitSubscription?: Subscription;
  paymentsSubscription?: Subscription;
  propertySubscription?: Subscription;

  // Payment Form
  paymentForm!: FormGroup;
  isSubmittingPayment = false;
  paymentSuccessMessage = '';
  paymentErrorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private tenantService: TenantService,
    private unitService: UnitService,
    private paymentService: PaymentService,
    private propertyService: PropertyService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.greetingMessage = this.getGreetingMessage();

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        console.error('Tenant ID not found in route');
        return;
      }

      this.tenantId = id;
      this.loadTenantAndUnit(this.tenantId);
    });
  }

  private loadTenantAndUnit(tenantId: string): void {
    this.tenantSubscription = this.tenantService.getTenantById(tenantId).subscribe({
      next: tenant => {
        this.tenant = tenant;

        if (!tenant.unitId) {
          console.warn('Tenant has no unit assigned');
          return;
        }

        this.unitId = tenant.unitId.toString();
        this.fetchUnitDetails(this.unitId);
        this.fetchPayments(this.unitId);
        this.initPaymentForm();
      },
      error: err => console.error('Error fetching tenant', err)
    });
  }

  fetchUnitDetails(unitId: string): void {
    this.unitSubscription = this.unitService.getUnitById(unitId).subscribe({
      next: unit => {
        this.unitDetails = unit;

        if (unit.propertyId) {
          this.propertySubscription =
            this.propertyService.getPopertyById(unit.propertyId.toString()).subscribe({
              next: property => {
                property.generalFeatures ??= [];
                property.indoorFeatures ??= [];
                property.outDoorFeatures ??= [];
                property.policyDescriptions ??= [];

                this.propertyDetails = property;
              },
              error: err => console.error('Error fetching property', err)
            });
        }

        // Update default amount in form
        if (this.paymentForm) {
          this.paymentForm.patchValue({ amount: unit.price });
        }
      },
      error: err => console.error('Error fetching unit', err)
    });
  }

  fetchPayments(unitId: string): void {
    this.paymentsSubscription = this.paymentService.getPaymentByUnitId(unitId).subscribe({
      next: payments => {
        const validPayments = payments
          .filter(p => !!p.createdAt)
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        this.payments = validPayments;

        const successfulPayments = validPayments.filter(p => p.status?.toLowerCase() === 'success');

        this.totalPaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
        this.calculateOverdue(successfulPayments);
      },
      error: err => console.error('Error fetching payments', err)
    });
  }

  private calculateOverdue(successfulPayments: Payment[]): void {
    if (!this.unitDetails?.price) return;

    const rent = this.unitDetails.price;
    const now = new Date();

    if (successfulPayments.length === 0) {
      this.overdueBalance = rent * 2;
      return;
    }

    const grouped: Record<string, Payment[]> = {};

    for (const p of successfulPayments) {
      const d = new Date(p.createdAt!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] ??= [];
      grouped[key].push(p);
    }

    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const lastKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const keyToUse = grouped[currentKey] ? currentKey : grouped[lastKey] ? lastKey : null;

    if (!keyToUse) {
      this.overdueBalance = rent * 2;
      return;
    }

    const monthTotal = grouped[keyToUse].reduce((sum, p) => sum + p.amount, 0);
    this.overdueBalance = monthTotal >= rent ? monthTotal - rent : rent - monthTotal;
  }

  private initPaymentForm(): void {
    this.paymentForm = this.fb.group({
      tenantId: [Number(this.tenantId)],
      unitId: [Number(this.unitId)],
      amount: [this.unitDetails?.price || 0, [Validators.required, Validators.min(1)]],
      phoneNumber: [this.tenant?.phoneNumber || '', [Validators.required, Validators.pattern('^07\\d{8}$')]],
      timestamp: [new Date()],
      status: ['pending']
    });
  }

  submitPayment(): void {
    if (!this.paymentForm || this.paymentForm.invalid) {
      this.paymentErrorMessage = 'Invalid payment details.';
      return;
    }

    this.isSubmittingPayment = true;
    this.paymentErrorMessage = '';
    this.paymentSuccessMessage = '';

    const paymentData: Partial<Payment> = {
      unitId: Number(this.unitId),
      amount: this.paymentForm.value.amount,
      phoneNumber: this.paymentForm.value.phoneNumber,
      createdAt: new Date(),
      status: 'pending'
    };

    this.paymentService.createPayment(paymentData as any).subscribe({
      next: () => {
        this.paymentSuccessMessage = 'Payment created successfully.';
        this.isSubmittingPayment = false;
        this.showPaymentModal = false;

        // Refresh payments list
        this.fetchPayments(this.unitId);
        this.initPaymentForm();
      },
      error: (err) => {
        this.paymentErrorMessage = 'Payment failed. Please try again.';
        this.isSubmittingPayment = false;
        console.error(err);
      }
    });
  }

  togglePropertyDetails(): void {
    this.showPropertyDetails = !this.showPropertyDetails;
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 18) return 'Good afternoon 🌤️';
    return 'Good evening 🌙';
  }

  // === MODAL CONTROLS ===
  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.tenantSubscription?.unsubscribe();
    this.unitSubscription?.unsubscribe();
    this.paymentsSubscription?.unsubscribe();
    this.propertySubscription?.unsubscribe();
  }
}
