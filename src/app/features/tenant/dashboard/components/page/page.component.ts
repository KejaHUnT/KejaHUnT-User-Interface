import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { Payment } from 'src/app/features/unit/payments/models/payment.model';
import { PaymentService } from 'src/app/features/unit/payments/services/payment.service';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnDestroy {
  unitId: string | null = null;
  unitDetails!: Unit;
  propertyDetails?: Property;
  payments: Payment[] = [];
  totalPaid: number = 0;
  overdueBalance: number | null = null;

  routeSubscription?: Subscription;
  paymentsSubscription?: Subscription;
  unitSubscription?: Subscription;
  propertySubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private unitService: UnitService,
    private paymentService: PaymentService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.unitId = params.get('id');
      if (this.unitId) {
        this.fetchUnitDetails(this.unitId);
        this.fetchPayments(this.unitId);
      } else {
        console.error('Unit ID not found in route');
      }
    });
  }

  fetchUnitDetails(unitId: string): void {
    this.unitSubscription = this.unitService.getUnitById(unitId).subscribe({
      next: (unit) => {
        this.unitDetails = unit;

        if (unit.propertyId) {
          this.propertySubscription = this.propertyService.getPopertyById(unit.propertyId.toString()).subscribe({
            next: (property) => {
              property.generalFeatures = property.generalFeatures ?? [];
              property.indoorFeatures = property.indoorFeatures ?? [];
              property.outDoorFeatures = property.outDoorFeatures ?? [];
              property.policyDescriptions = property.policyDescriptions ?? [];

              this.propertyDetails = property;
            },
            error: (err) => console.error('Error fetching property details', err)
          });
        }
      },
      error: (err) => console.error('Error fetching unit details', err)
    });
  }

  fetchPayments(unitId: string): void {
  this.paymentsSubscription = this.paymentService.getPaymentByUnitId(unitId).subscribe({
    next: (payments) => {
      const validPayments = payments.filter(p => !!p.createdAt);
      validPayments.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

      this.payments = validPayments;

      //  Filter only successful payments
      const successfulPayments = validPayments.filter(p => p.status?.toLowerCase() === 'success');

      this.totalPaid = successfulPayments.reduce((acc, p) => acc + p.amount, 0);

      if (this.unitDetails?.price) {
        const rent = this.unitDetails.price;
        const now = new Date();

        if (successfulPayments.length === 0) {
          //  No successful payments → 2 months rent due
          this.overdueBalance = rent * 2;
          return;
        }

        //  Group successful payments by year and month (e.g., "2025-06")
        const paymentGroups: { [key: string]: Payment[] } = {};

        successfulPayments.forEach(payment => {
          const date = new Date(payment.createdAt!);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!paymentGroups[key]) paymentGroups[key] = [];
          paymentGroups[key].push(payment);
        });

        //  Get current month key
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        // Check for this month or last month payments
        const recentMonthKey = paymentGroups[currentMonthKey]
          ? currentMonthKey
          : paymentGroups[lastMonthKey]
          ? lastMonthKey
          : null;

        if (!recentMonthKey) {
          //  No payments this month or last month → overdue 2 months
          this.overdueBalance = rent * 2;
        } else {
          const recentPayments = paymentGroups[recentMonthKey];
          const monthTotal = recentPayments.reduce((acc, p) => acc + p.amount, 0);

          if (monthTotal >= rent) {
            //  Rent covered → check if there's an overpay
            const overpay = monthTotal - rent;
            this.overdueBalance = overpay > 0 ? -overpay : 0; // negative = overpaid
          } else {
            //  Underpaid for the month
            this.overdueBalance = rent - monthTotal;
          }
        }
      }
    },
    error: (err) => console.error('Error fetching payments', err)
  });
}


  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.unitSubscription?.unsubscribe();
    this.paymentsSubscription?.unsubscribe();
    this.propertySubscription?.unsubscribe();
  }
}
