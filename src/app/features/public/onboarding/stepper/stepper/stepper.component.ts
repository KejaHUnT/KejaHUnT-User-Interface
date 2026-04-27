import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AddTenantStepComponent } from '../../step1/add-tenant-step/add-tenant-step.component';
import { CreateBookingStepComponent } from '../../step2/create-booking-step/create-booking-step/create-booking-step.component';
import { PaymentStepComponent } from '../../step3/create-payment-step/create-payment-step/create-payment-step.component';

@Component({
  selector: 'app-stepper-wrapper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit, OnDestroy {
  unitId: number = 0;
  tenantId: number = 0;
  paymentAmount: number = 0;

  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild('addTenant') addTenant?: AddTenantStepComponent;
  @ViewChild('createBooking') createBooking?: CreateBookingStepComponent;
  @ViewChild('paymentStep') paymentStep?: PaymentStepComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.unitId = +params['unitId'] || 0;
      this.paymentAmount = +params['unitRent'] || 0;
    });
  }

  /** Expose the tenant form to the mat-step [stepControl] binding */
  get addTenantForm(): AbstractControl {
    return this.addTenant?.form ?? new FormGroup({});
  }

  /** Step 1 → 2: validate, submit tenant, then advance */
  submitTenantAndContinue(): void {
    if (!this.addTenant?.form?.valid) {
      this.addTenant?.form?.markAllAsTouched();
      return;
    }

    this.addTenant.submitTenant(() => {
      this.tenantId = this.addTenant?.tenantId ?? 0;

      // FIX: do NOT leak tenantId to localStorage here;
      // TenantFlowService (BehaviorSubject) is the source of truth.
      // Only keep for defensive fallback across hard refreshes if needed.
      if (this.tenantId) {
        sessionStorage.setItem('tenantId', this.tenantId.toString());
      }

      // FIX: Null-guard before accessing child component methods
      if (this.createBooking) {
        this.createBooking.initialize(this.unitId, this.tenantId);
        this.createBooking.stepper = this.stepper;
      }

      // FIX: Use setTimeout(0) to allow Angular CD to wire @ViewChild
      // before calling stepper.next(), preventing ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => this.stepper.next(), 0);
    });
  }

  /** Step 3: delegate payment submission to child */
  submitPaymentStep(): void {
    this.paymentStep?.submitPayment();
  }

  /** Reset the entire flow back to step 1 */
  resetToEdit(): void {
    this.tenantId = 0;
    sessionStorage.removeItem('tenantId');
    // FIX: reset() then set selectedIndex — avoids race condition
    this.stepper.reset();
    setTimeout(() => (this.stepper.selectedIndex = 0), 0);
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('tenantId');
  }
}