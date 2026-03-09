import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { MonthlyLedger, PaymentResponse, PaymentStatus } from '../../models/paystack-models';
import { PaystackPaymentService } from '../../services/paystack-payment.ts.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit, OnDestroy {

  propertyId: string | null = null;
  property?: Property;
  units: Unit[] = [];

  // Store all payments for the property
  payments: PaymentResponse[] = [];
     PaymentStatus = PaymentStatus;
  // Ledger by unit for monthly monitoring
  ledgerByUnit: { [unitId: number]: MonthlyLedger } = {};

  routeSubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  getPaymentsByPropertySubscription?: Subscription;

  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private paystackService: PaystackPaymentService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        this.propertyId = params.get('id');
        if (this.propertyId) {
          this.loadPropertyAndPayments(this.propertyId);
        }
      }
    });
  }

  private loadPropertyAndPayments(propertyId: string): void {
    // Load property details
    this.getPropertyByIdSubscription = this.propertyService.getPopertyById(propertyId).subscribe({
      next: (property) => {
        this.property = property;
        this.units = property.units || [];

        // After loading property, fetch all payments for property
        this.getPaymentsByPropertySubscription = this.paystackService.getPaymentsByProperty(Number(propertyId), 1, 1000).subscribe({
          next: (payments) => {
            this.payments = payments;
            this.generateMonthlyLedger();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching property payments', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching property', err);
        this.isLoading = false;
      }
    });
  }

  // Generate monthly ledger for each unit
  private generateMonthlyLedger(): void {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    this.units.forEach(unit => {
      const unitPayments = this.payments.filter(p => p.unitId === unit.id);
      const currentMonthPayments = unitPayments.filter(p => p.periodMonth === currentMonth && p.periodYear === currentYear);

      const totalPaid = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const expectedRent = unit.price || 0; // assuming Unit model has rentAmount

      let status: 'Paid' | 'Partial' | 'Overpaid' | 'Unpaid' = 'Unpaid';
      if (totalPaid === 0) status = 'Unpaid';
      else if (totalPaid < expectedRent) status = 'Partial';
      else if (totalPaid === expectedRent) status = 'Paid';
      else if (totalPaid > expectedRent) status = 'Overpaid';

      this.ledgerByUnit[unit.id] = {
        periodMonth: currentMonth,
        periodYear: currentYear,
        expectedRent,
        totalPaid,
        balance: expectedRent - totalPaid,
        status,
        payments: currentMonthPayments
      };
    });
  }

  // Get last payment status for a unit (optional)
  getLastPaymentStatus(unitId: number): string | null {
    const unitPayments = this.payments.filter(p => p.unitId === unitId);
    if (!unitPayments || unitPayments.length === 0) return null;
    return PaymentStatus[unitPayments[unitPayments.length - 1].status];
  }

  goToUnitPayments(unitId: number): void {
    this.router.navigate(['unit/payment', unitId]);
  }

  // Helper methods to replace complex expressions in template
getTotalRentCollected(): number {
  return this.payments.reduce((sum, p) => sum + p.amount, 0);
}

getPendingPaymentsTotal(): number {
  return this.payments
    .filter(p => p.status === PaymentStatus.Pending)
    .reduce((sum, p) => sum + p.amount, 0);
}

getUnitsPaidCount(): number {
  return Object.values(this.ledgerByUnit).filter(l => l.status === 'Paid').length;
}

getPaymentsForUnit(unitId: number): PaymentResponse[] {
  return this.payments.filter(p => p.unitId === unitId);
}

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
    this.getPaymentsByPropertySubscription?.unsubscribe();
  }

}
