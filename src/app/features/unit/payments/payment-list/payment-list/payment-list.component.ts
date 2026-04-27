import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { Property } from 'src/app/features/property/models/property.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PaymentServiceService } from 'src/app/features/unit/payments/services/payment-service.service';
import { UnitPaymentsDto, PaymentTransactionDto } from 'src/app/features/unit/payments/models/payment.model';
import { UnitPaymentStatus, PaymentTransactionStatus } from '@app/features/unit/payments/enums/payment.enum';

// =====================================================
// LOCAL INTERFACES
// =====================================================

interface MonthlyLedger {
  periodMonth: number;
  periodYear: number;
  expectedRent: number;
  totalPaid: number;
  balance: number;
  status: UnitPaymentStatus;
  allPayments: UnitPaymentsDto[];
  transactions: PaymentTransactionDto[];
}

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit, OnDestroy {

  propertyId: string | null = null;
  propertyIdNumber!: number;

  property?: Property;
  units: Unit[] = [];

  unitPaymentsMap: { [unitId: number]: UnitPaymentsDto[] } = {};
  ledgerByUnit:    { [unitId: number]: MonthlyLedger }      = {};

  isLoading = false;
  isPaymentModalOpen = false;

  // Expose enums to the template
  readonly UnitPaymentStatus        = UnitPaymentStatus;
  readonly PaymentTransactionStatus = PaymentTransactionStatus;

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

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private paymentService: PaymentServiceService
  ) {}

  // =====================================================
  // LIFECYCLE
  // =====================================================

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe(params => {
      this.propertyId = params.get('id');
      if (this.propertyId) {
        this.propertyIdNumber = Number(this.propertyId);
        this.loadAll(this.propertyId);
      }
    });
    this.subs.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // =====================================================
  // LOAD
  // =====================================================
  private loadAll(propertyId: string): void {
    this.isLoading = true;

    const propertySub = this.propertyService.getPopertyById(propertyId).subscribe({
      next: (property) => {
        this.property = property;
        this.units    = property.units || [];

        if (!this.units.length) {
          this.isLoading = false;
          return;
        }

        const paymentCalls = this.units.map(unit =>
          this.paymentService.getByUnit(unit.id)
        );

        const paymentsSub = forkJoin(paymentCalls).subscribe({
          next: (results) => {
            this.units.forEach((unit, index) => {
              this.unitPaymentsMap[unit.id] = results[index] || [];
            });
            this.buildLedgers();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching unit payments', err);
            this.isLoading = false;
          }
        });

        this.subs.add(paymentsSub);
      },
      error: (err) => {
        console.error('Error fetching property', err);
        this.isLoading = false;
      }
    });

    this.subs.add(propertySub);
  }

  // =====================================================
  // BUILD LEDGERS
  // =====================================================
  private buildLedgers(): void {
    const now          = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear  = now.getFullYear();

    this.units.forEach(unit => {
      const allPayments  = this.unitPaymentsMap[unit.id] || [];
      const currentPeriod = allPayments.find(
        up => up.periodMonth === currentMonth && up.periodYear === currentYear
      );

      const totalPaid    = currentPeriod?.paidAmount     ?? 0;
      const expectedRent = currentPeriod?.expectedAmount ?? unit.price ?? 0;
      // Positive = still owed; negative = overpaid
      const balance      = expectedRent - totalPaid;

      let status: UnitPaymentStatus;
      if (totalPaid <= 0)    status = UnitPaymentStatus.Pending;
      else if (balance === 0) status = UnitPaymentStatus.Paid;
      else if (balance < 0)   status = UnitPaymentStatus.Overpaid;
      else                    status = UnitPaymentStatus.Partial;

      const transactions: PaymentTransactionDto[] = allPayments.flatMap(
        up => up.transactions ?? []
      );

      this.ledgerByUnit[unit.id] = {
        periodMonth: currentMonth,
        periodYear:  currentYear,
        expectedRent,
        totalPaid,
        balance,
        status,
        allPayments,
        transactions
      };
    });
  }

  // =====================================================
  // TEMPLATE HELPERS
  // =====================================================

  getTotalRentCollected(): number {
    return Object.values(this.unitPaymentsMap)
      .flat()
      .reduce((sum, up) => sum + (up.paidAmount ?? 0), 0);
  }

  getPendingPaymentsTotal(): number {
    return Object.values(this.ledgerByUnit)
      .filter(l =>
        l.status === UnitPaymentStatus.Pending ||
        l.status === UnitPaymentStatus.Partial
      )
      .reduce((sum, l) => sum + Math.max(l.expectedRent - l.totalPaid, 0), 0);
  }

  getUnitsPaidCount(): number {
    return Object.values(this.ledgerByUnit)
      .filter(l => l.status === UnitPaymentStatus.Paid)
      .length;
  }

  getPaymentsForUnit(unitId: number): UnitPaymentsDto[] {
    return this.unitPaymentsMap[unitId] || [];
  }

  /** Status label of the most recent transaction for a unit */
  getLastPaymentStatus(unitId: number): string | null {
    const allTx = (this.unitPaymentsMap[unitId] || [])
      .flatMap(up => up.transactions ?? [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!allTx.length) return null;
    return this.transactionStatusLabels[allTx[0].status] ?? 'Unknown';
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

  getUnitStatusClass(unitId: number): string {
    const status = this.ledgerByUnit[unitId]?.status;
    switch (status) {
      case UnitPaymentStatus.Paid:      return 'pd-unit--paid';
      case UnitPaymentStatus.Partial:   return 'pd-unit--partial';
      case UnitPaymentStatus.Overpaid:  return 'pd-unit--overpaid';
      default:                          return 'pd-unit--unpaid';
    }
  }

  getUnitBadgeClass(unitId: number): string {
    const status = this.ledgerByUnit[unitId]?.status;
    switch (status) {
      case UnitPaymentStatus.Paid:      return 'pd-usb--paid';
      case UnitPaymentStatus.Partial:   return 'pd-usb--partial';
      case UnitPaymentStatus.Overpaid:  return 'pd-usb--overpaid';
      default:                          return 'pd-usb--unpaid';
    }
  }

  getUnitStatusLabel(unitId: number): string {
    const status = this.ledgerByUnit[unitId]?.status;
    if (status === undefined) return 'Unpaid';
    return UnitPaymentStatus[status];
  }

  formatMonthYear(month: number, year: number): string {
    return new Date(year, month - 1)
      .toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // =====================================================
  // NAVIGATION & MODAL
  // =====================================================

  goToUnitPayments(unitId: number): void {
    this.router.navigate(['unit/payment', unitId]);
  }

  openPaymentModal(): void  { this.isPaymentModalOpen = true; }
  closePaymentModal(): void { this.isPaymentModalOpen = false; }

  onPaymentSaved(): void {
    if (this.propertyId) this.loadAll(this.propertyId);
  }
}