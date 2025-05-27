import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { Payment } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';
import { Unit } from 'src/app/features/property/models/unit.model';
import { Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent {

  propertyId: string | null = null;
  property?: Property;
  units: Unit[] = [];
  paymentsByUnit: { [unitId: number]: Payment[] } = {};

  routeSubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private paymentService: PaymentService
  ) {}

  getLastPaymentStatus(unitId: number): string | null {
    const payments = this.paymentsByUnit[unitId];
    if (!payments || payments.length === 0) return null;
    return payments[payments.length - 1].status;
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        this.propertyId = params.get('id');

        if (this.propertyId) {
          this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.propertyId).subscribe({
            next: (propertyResponse) => {
              this.property = propertyResponse;
              this.units = this.property.units || [];

              this.units.forEach(unit => {
                this.loadPaymentsForUnit(unit.id);
              });
            },
            error: (err) => {
              console.error('Error fetching property', err);
            }
          });
        }
      }
    });
  }

  loadPaymentsForUnit(unitId: number): void {
    this.paymentService.getPaymentByUnitId(unitId.toString()).subscribe({
      next: (payments) => {
        this.paymentsByUnit[unitId] = payments;
      },
      error: (err) => {
        console.error(`Failed to load payments for unit ${unitId}`, err);
        this.paymentsByUnit[unitId] = [];
      }
    });
  }

  goToUnitPayments(unitId: number): void {
    this.router.navigate(['unit/payment', unitId]);
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
  }

}
