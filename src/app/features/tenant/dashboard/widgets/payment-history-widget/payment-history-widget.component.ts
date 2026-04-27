import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PaymentServiceService } from 'src/app/features/unit/payments/services/payment-service.service';
import { UnitPaymentsDto, PaymentTransactionDto } from 'src/app/features/unit/payments/models/payment.model';
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
  selector: 'app-payment-history-widget',
  templateUrl: './payment-history-widget.component.html',
  styleUrls: ['./payment-history-widget.component.css']
})
export class PaymentHistoryWidgetComponent implements OnChanges {

  @Input() unitId!: number;
  @Input() expectedRent: number = 0;

  // Expose enums to the template
  readonly UnitPaymentStatus = UnitPaymentStatus;
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

  unitPayments: UnitPaymentsDto[] = [];
  monthlyLedgers: MonthlyLedger[] = [];
  totalPaid = 0;
  isLoading = false;
  loadError = false;

  expandedMonths = new Set<string>();

  constructor(private paymentService: PaymentServiceService) {}

  // =====================================================
  // INPUT WATCHER
  // =====================================================
  ngOnChanges(changes: SimpleChanges): void {
    const unitIdChange = changes['unitId'];
    if (
      unitIdChange &&
      unitIdChange.currentValue &&
      unitIdChange.currentValue !== unitIdChange.previousValue
    ) {
      this.loadPayments(unitIdChange.currentValue);
    }
  }

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================
  private loadPayments(unitId: number): void {
    this.isLoading = true;
    this.loadError = false;

    this.paymentService.getByUnit(unitId).subscribe({
      next: (payments) => {
        this.unitPayments = payments || [];
        this.buildMonthlyLedgers();
        this.calculateTotalPaid();
        this.isLoading = false;
      },
      error: () => {
        console.error('Failed to load payments for unit', unitId);
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  // =====================================================
  // LEDGER BUILDER
  // =====================================================
  private buildMonthlyLedgers(): void {
    if (!this.unitPayments.length) {
      this.monthlyLedgers = [];
      return;
    }

    const ledgers: MonthlyLedger[] = this.unitPayments.map(up => {
      const totalPaid = up.paidAmount ?? 0;
      const expected  = up.expectedAmount ?? this.expectedRent;
      const balance   = expected - totalPaid; // positive = still owed

      let status: UnitPaymentStatus;
      if (totalPaid <= 0) {
        status = UnitPaymentStatus.Pending;
      } else if (balance === 0) {
        status = UnitPaymentStatus.Paid;
      } else if (balance < 0) {
        status = UnitPaymentStatus.Overpaid;
      } else {
        status = UnitPaymentStatus.Partial;
      }

      return {
        periodMonth:  up.periodMonth,
        periodYear:   up.periodYear,
        expectedRent: expected,
        totalPaid,
        balance,
        status,
        // `up.transactions` is now correctly typed as PaymentTransactionDto[]
        payments: up.transactions ?? []
      };
    });

    this.monthlyLedgers = ledgers.sort((a, b) =>
      new Date(b.periodYear, b.periodMonth - 1).getTime() -
      new Date(a.periodYear, a.periodMonth - 1).getTime()
    );
  }

  // =====================================================
  // TOTAL PAID
  // =====================================================
  private calculateTotalPaid(): void {
    this.totalPaid = this.unitPayments.reduce(
      (sum, up) => sum + (up.paidAmount ?? 0),
      0
    );
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
        return 'status-success';
      case PaymentTransactionStatus.Pending:
      case PaymentTransactionStatus.Processing:
      case PaymentTransactionStatus.Initialized:
        return 'status-pending';
      case PaymentTransactionStatus.Failed:
      case PaymentTransactionStatus.Timeout:
        return 'status-failed';
      case PaymentTransactionStatus.Cancelled:
      case PaymentTransactionStatus.Reversed:
      case PaymentTransactionStatus.Refunded:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // =====================================================
  // PROGRESS HELPERS
  // =====================================================
  getProgressPercent(ledger: MonthlyLedger): number {
    if (ledger.expectedRent <= 0) return 0;
    return Math.min((ledger.totalPaid / ledger.expectedRent) * 100, 100);
  }

  getProgressLabel(ledger: MonthlyLedger): string {
    if (ledger.expectedRent <= 0) return '0%';
    return `${Math.round((ledger.totalPaid / ledger.expectedRent) * 100)}%`;
  }

  // =====================================================
  // MONTH FORMAT
  // =====================================================
  formatMonthYear(month: number, year: number): string {
    return new Date(year, month - 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // =====================================================
  // ACCORDION
  // =====================================================
  toggleLedger(ledger: MonthlyLedger): void {
    const key = `${ledger.periodYear}-${ledger.periodMonth}`;
    if (this.expandedMonths.has(key)) {
      this.expandedMonths.delete(key);
    } else {
      this.expandedMonths.add(key);
    }
  }

  isLedgerExpanded(ledger: MonthlyLedger): boolean {
    return this.expandedMonths.has(`${ledger.periodYear}-${ledger.periodMonth}`);
  }
}