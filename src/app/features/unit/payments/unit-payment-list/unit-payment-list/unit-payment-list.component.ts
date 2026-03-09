import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';

import { PaymentResponse, PaymentStatus } from '../../models/paystack-models';
import { PaystackPaymentService } from '../../services/paystack-payment.ts.service';
import { UnitService } from '../../../services/unit.service';
import { Tenant } from 'src/app/features/tenant/models/tenant.model';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';
import { Unit } from 'src/app/features/property/models/unit.model';

interface MonthlyLedger {
  periodMonth: number;
  periodYear: number;
  expectedRent: number;
  totalPaid: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Overpaid' | 'Unpaid';
  payments: PaymentResponse[];
}

@Component({
  selector: 'app-unit-payment-list',
  templateUrl: './unit-payment-list.component.html',
  styleUrls: ['./unit-payment-list.component.css']
})
export class UnitPaymentListComponent implements OnInit, OnDestroy {

  unitId: number | null = null;

  unit: Unit | null = null;

  payments: PaymentResponse[] = [];
  ledger: MonthlyLedger[] = [];

  tenant: Tenant | null = null;

  monthlyRent = 0;
  totalBalance = 0;

  loading = false;
  errorMessage: string | null = null;

  private subscriptions = new Subscription();

  private readonly months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  constructor(
    private route: ActivatedRoute,
    private paystackPaymentService: PaystackPaymentService,
    private unitService: UnitService,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {

    const routeSub = this.route.paramMap.subscribe(params => {

      const id = params.get('id');
      if (!id) return;

      this.unitId = Number(id);
      this.fetchAllFinancialData(id);
    });

    this.subscriptions.add(routeSub);
  }

  fetchAllFinancialData(unitId: string): void {

    this.loading = true;
    this.errorMessage = null;

    const combined$ = forkJoin({

      unit: this.unitService
        .getUnitById(unitId)
        .pipe(catchError(() => of(null))),

      payments: this.paystackPaymentService
        .getPaymentsByUnit(Number(unitId))
        .pipe(catchError(() => of([]))),

      tenants: this.tenantService
        .getAllTenants()
        .pipe(catchError(() => of([])))

    });

    const sub = combined$.subscribe({
      next: ({ unit, payments, tenants }) => {

        if (!unit) {
          this.errorMessage = 'Unit not found.';
          this.loading = false;
          return;
        }

        // ⭐ STORE UNIT (critical for template)
        this.unit = unit;

        this.monthlyRent = unit.price ?? 0;

        this.payments = (payments || []).filter(
          p => p.status === PaymentStatus.Success
        );

        this.tenant =
          (tenants as Tenant[]).find(t => t.unitId === Number(unitId)) ?? null;

        this.buildLedger();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load financial data.';
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  buildLedger(): void {

    if (!this.monthlyRent) {
      this.ledger = [];
      this.totalBalance = 0;
      return;
    }

    const grouped = new Map<string, PaymentResponse[]>();

    this.payments.forEach(payment => {

      if (!payment.periodYear || !payment.periodMonth) return;

      const key = `${payment.periodYear}-${payment.periodMonth}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(payment);
    });

    const ledgerArray: MonthlyLedger[] = [];

    grouped.forEach((payments, key) => {

      const [year, month] = key.split('-').map(Number);

      payments.sort((a,b)=>
        new Date(b.createdAt ?? '').getTime() -
        new Date(a.createdAt ?? '').getTime()
      );

      const totalPaid =
        payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

      const balance = totalPaid - this.monthlyRent;

      let status: MonthlyLedger['status'];

      if (totalPaid === 0) status = 'Unpaid';
      else if (balance === 0) status = 'Paid';
      else if (balance > 0) status = 'Overpaid';
      else status = 'Partial';

      ledgerArray.push({
        periodMonth: month,
        periodYear: year,
        expectedRent: this.monthlyRent,
        totalPaid,
        balance,
        status,
        payments
      });

    });

    this.ledger = ledgerArray.sort((a, b) =>
      new Date(b.periodYear, b.periodMonth - 1).getTime() -
      new Date(a.periodYear, a.periodMonth - 1).getTime()
    );

    this.calculateTotalBalance();
  }

  calculateTotalBalance(): void {
    this.totalBalance =
      this.ledger.reduce((sum, m) => sum + m.balance, 0);
  }

  getMonthLabel(month:number, year:number){
    return `${this.months[month-1]} ${year}`;
  }

  getTenantInitials(): string {

    if (!this.tenant?.fullName) return '?';

    const names = this.tenant.fullName.split(' ');
    return names.length > 1
      ? names[0][0] + names[1][0]
      : names[0][0];
  }

  trackByLedger(index: number, item: MonthlyLedger) {
    return `${item.periodYear}-${item.periodMonth}`;
  }

  trackByPayment(index: number, payment: PaymentResponse) {
    return payment.id;
  }

  getRowClass(status: string) {
    return {
      'row-paid': status === 'Paid',
      'row-overpaid': status === 'Overpaid',
      'row-partial': status === 'Partial',
      'row-unpaid': status === 'Unpaid'
    };
  }

  get hasLedger(): boolean {
    return this.ledger.length > 0;
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
