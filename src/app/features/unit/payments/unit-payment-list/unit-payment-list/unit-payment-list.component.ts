import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';

import { UnitService } from '../../../services/unit.service';
import { Tenant } from 'src/app/features/tenant/models/tenant.model';
import { TenantService } from 'src/app/features/tenant/services/tenant.service';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PaymentServiceService } from '../../services/payment-service.service';
import { UnitPaymentsDto, PaymentTransactionDto } from '../../models/payment.model';
import { UnitPaymentStatus, PaymentTransactionStatus } from '@app/features/unit/payments/enums/payment.enum';

interface MonthlyLedger {
  periodMonth: number;
  periodYear: number;
  expectedRent: number;
  totalPaid: number;
  balance: number;
  status: UnitPaymentStatus;
  payments: PaymentTransactionDto[];
}

@Component({
  selector: 'app-unit-payment-list',
  templateUrl: './unit-payment-list.component.html',
  styleUrls: ['./unit-payment-list.component.css']
})
export class UnitPaymentListComponent implements OnInit, OnDestroy {

  unitId: number | null = null;
  unit: Unit | null = null;

  unitPayments: UnitPaymentsDto[] = [];
  ledger: MonthlyLedger[] = [];
  tenant: Tenant | null = null;

  monthlyRent  = 0;
  totalBalance = 0;

  loading       = false;
  errorMessage: string | null = null;

  // Expose enums to the template
  readonly UnitPaymentStatus        = UnitPaymentStatus;
  readonly PaymentTransactionStatus = PaymentTransactionStatus;

  readonly unitPaymentStatusLabels: Record<UnitPaymentStatus, string> = {
    [UnitPaymentStatus.Pending]:   'Pending',
    [UnitPaymentStatus.Partial]:   'Partial',
    [UnitPaymentStatus.Paid]:      'Paid',
    [UnitPaymentStatus.Overpaid]:  'Overpaid',
    [UnitPaymentStatus.Failed]:    'Failed',
    [UnitPaymentStatus.Cancelled]: 'Cancelled',
    [UnitPaymentStatus.Refunded]:  'Refunded',
    [UnitPaymentStatus.Disputed]:  'Disputed',
  };

  readonly transactionStatusLabels: Record<PaymentTransactionStatus, string> = {
    [PaymentTransactionStatus.Initialized]: 'Initialized',
    [PaymentTransactionStatus.Pending]:     'Pending',
    [PaymentTransactionStatus.Processing]:  'Processing',
    [PaymentTransactionStatus.Success]:     'Success',
    [PaymentTransactionStatus.Failed]:      'Failed',
    [PaymentTransactionStatus.Cancelled]:   'Cancelled',
    [PaymentTransactionStatus.Timeout]:     'Timeout',
    [PaymentTransactionStatus.Reversed]:    'Reversed',
    [PaymentTransactionStatus.Refunded]:    'Refunded',
  };

  private subscriptions = new Subscription();

  private readonly months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentServiceService,
    private unitService: UnitService,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.unitId = Number(id);
      this.fetchAllFinancialData(Number(id));
    });
    this.subscriptions.add(routeSub);
  }

  fetchAllFinancialData(unitId: number): void {
    this.loading = true;
    this.errorMessage = null;

    const combined$ = forkJoin({
      unit: this.unitService
        .getUnitById(unitId.toString())
        .pipe(catchError(() => of(null))),
      payments: this.paymentService
        .getByUnit(unitId)
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

        this.unit        = unit;
        this.monthlyRent = unit.price ?? 0;
        this.unitPayments = payments || [];
        this.tenant = (tenants as Tenant[]).find(t => t.unitId === unitId) ?? null;

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

  // =====================================================
  // LEDGER BUILDER
  // All transactions are shown (not just successful ones).
  // totalPaid is derived from Success transactions only —
  // failed/pending txs don't count toward what was collected.
  // =====================================================
  buildLedger(): void {
    if (!this.unitPayments.length) {
      this.ledger       = [];
      this.totalBalance = 0;
      return;
    }

    const ledgerArray: MonthlyLedger[] = this.unitPayments.map(up => {

      // ALL transactions are displayed so the user sees the full picture
      const allTransactions = up.transactions ?? [];

      // Only count successful transactions toward totalPaid
      const totalPaid = allTransactions
        .filter(t => t.status === PaymentTransactionStatus.Success)
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

      const expected = up.expectedAmount ?? this.monthlyRent;
      // Positive = still owed; negative = overpaid
      const balance  = expected - totalPaid;

      let status: UnitPaymentStatus;
      if (totalPaid <= 0)    status = UnitPaymentStatus.Pending;
      else if (balance === 0) status = UnitPaymentStatus.Paid;
      else if (balance < 0)   status = UnitPaymentStatus.Overpaid;
      else                    status = UnitPaymentStatus.Partial;

      return {
        periodMonth:  up.periodMonth,
        periodYear:   up.periodYear,
        expectedRent: expected,
        totalPaid,
        balance,
        status,
        payments: allTransactions   // ← ALL, not filtered
      };
    });

    this.ledger = ledgerArray.sort((a, b) =>
      new Date(b.periodYear, b.periodMonth - 1).getTime() -
      new Date(a.periodYear, a.periodMonth - 1).getTime()
    );

    this.calculateTotalBalance();
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.ledger.reduce((sum, m) => sum + m.balance, 0);
  }

  // =====================================================
  // LABEL & CLASS HELPERS
  // =====================================================

  getUnitPaymentStatusLabel(status: UnitPaymentStatus): string {
    return this.unitPaymentStatusLabels[status] ?? 'Unknown';
  }

  getTransactionStatusLabel(status: PaymentTransactionStatus): string {
    return this.transactionStatusLabels[status] ?? 'Unknown';
  }

  getTransactionStatusClass(status: PaymentTransactionStatus): string {
    switch (status) {
      case PaymentTransactionStatus.Success:
        return 'pd-tx--paid';
      case PaymentTransactionStatus.Initialized:
        return 'pd-tx--initialized';
      case PaymentTransactionStatus.Pending:
      case PaymentTransactionStatus.Processing:
        return 'pd-tx--pending';
      case PaymentTransactionStatus.Failed:
      case PaymentTransactionStatus.Timeout:
        return 'pd-tx--failed';
      case PaymentTransactionStatus.Cancelled:
      case PaymentTransactionStatus.Reversed:
      case PaymentTransactionStatus.Refunded:
        return 'pd-tx--cancelled';
      default:
        return '';
    }
  }

  getMonthLabel(month: number, year: number): string {
    return `${this.months[month - 1]} ${year}`;
  }

  getTenantInitials(): string {
    if (!this.tenant?.fullName) return '?';
    const names = this.tenant.fullName.split(' ');
    return names.length > 1
      ? names[0][0] + names[1][0]
      : names[0][0];
  }

  trackByLedger(_: number, item: MonthlyLedger): string {
    return `${item.periodYear}-${item.periodMonth}`;
  }

  trackByPayment(_: number, payment: PaymentTransactionDto): number {
    return payment.id;
  }

  get hasLedger(): boolean { return this.ledger.length > 0; }
  get hasError():  boolean { return !!this.errorMessage; }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}