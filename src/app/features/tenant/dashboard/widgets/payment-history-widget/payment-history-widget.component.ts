import { Component, Input, OnInit } from '@angular/core';
import { PaystackPaymentService } from 'src/app/features/unit/payments/services/paystack-payment.ts.service';
import { PaymentResponse, PaymentStatus, MonthlyLedger } from 'src/app/features/unit/payments/models/paystack-models';

@Component({
  selector: 'app-payment-history-widget',
  templateUrl: './payment-history-widget.component.html',
  styleUrls: ['./payment-history-widget.component.css']
})
export class PaymentHistoryWidgetComponent implements OnInit {
  @Input() unitId!: number;
  @Input() expectedRent: number = 0; // rent for this unit

  payments: PaymentResponse[] = [];
  monthlyLedgers: MonthlyLedger[] = [];
  totalPaid = 0;

  // Track which months are expanded
  expandedMonths = new Set<string>();

  constructor(private paystackService: PaystackPaymentService) {}

  ngOnInit(): void {
    if (!this.unitId) return;

    this.paystackService.getPaymentsByUnit(this.unitId).subscribe(payments => {
      this.payments = payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.totalPaid = payments
        .filter(p => p.status === PaymentStatus.Success)
        .reduce((sum, p) => sum + p.amount, 0);

      this.buildMonthlyLedgers();
    });
  }

  /** ---------------- Build Monthly Ledger ---------------- */
  private buildMonthlyLedgers(): void {
    const ledgerMap: { [key: string]: MonthlyLedger } = {};

    for (const p of this.payments) {
      const key = `${p.periodYear}-${p.periodMonth}`;
      if (!ledgerMap[key]) {
        ledgerMap[key] = {
          periodMonth: p.periodMonth,
          periodYear: p.periodYear,
          expectedRent: this.expectedRent,
          totalPaid: 0,
          balance: this.expectedRent,
          status: 'Unpaid',
          payments: []
        };
      }

      ledgerMap[key].payments.push(p);

      if (p.status === PaymentStatus.Success) {
        ledgerMap[key].totalPaid += p.amount;
        ledgerMap[key].balance = ledgerMap[key].expectedRent - ledgerMap[key].totalPaid;
      }
    }

    // Determine status
    for (const key of Object.keys(ledgerMap)) {
      const ledger = ledgerMap[key];
      if (ledger.totalPaid === 0) ledger.status = 'Unpaid';
      else if (ledger.totalPaid < ledger.expectedRent) ledger.status = 'Partial';
      else if (ledger.totalPaid === ledger.expectedRent) ledger.status = 'Paid';
      else if (ledger.totalPaid > ledger.expectedRent) ledger.status = 'Overpaid';
    }

    // Sort descending by period
    this.monthlyLedgers = Object.values(ledgerMap)
      .sort((a, b) => new Date(b.periodYear, b.periodMonth - 1).getTime() - new Date(a.periodYear, a.periodMonth - 1).getTime());
  }

  /** ---------------- Helpers ---------------- */
  getPaymentStatusLabel(status: PaymentStatus | number): string {
    switch (status) {
      case PaymentStatus.Success: return 'Success';
      case PaymentStatus.Pending: return 'Pending';
      case PaymentStatus.Failed: return 'Failed';
      default: return 'Unknown';
    }
  }

  formatMonthYear(month: number, year: number): string {
    return `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;
  }

  /** ---------------- Toggle Ledger ---------------- */
  toggleLedger(ledger: MonthlyLedger): void {
    const key = `${ledger.periodYear}-${ledger.periodMonth}`;
    if (this.expandedMonths.has(key)) this.expandedMonths.delete(key);
    else this.expandedMonths.add(key);
  }

  isLedgerExpanded(ledger: MonthlyLedger): boolean {
    const key = `${ledger.periodYear}-${ledger.periodMonth}`;
    return this.expandedMonths.has(key);
  }
}
