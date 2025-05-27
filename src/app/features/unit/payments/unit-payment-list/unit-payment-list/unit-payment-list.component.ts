import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Payment } from '../../models/payment.model';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-unit-payment-list',
  templateUrl: './unit-payment-list.component.html',
  styleUrls: ['./unit-payment-list.component.css']
})
export class UnitPaymentListComponent {
  unitId: string | null = null;
  payments: Payment[] = [];
  routeSubscription?: Subscription;
  paymentsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}


  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.unitId = params.get('id');
      if (this.unitId) {
        this.fetchPayments(this.unitId);
      }
    });
  }

  fetchPayments(unitId: string): void {
    this.paymentsSubscription = this.paymentService.getPaymentByUnitId(unitId).subscribe({
      next: (response) => {
        this.payments = response;
      },
      error: (err) => {
        console.error('Failed to fetch payments:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.paymentsSubscription?.unsubscribe();
  }

}
