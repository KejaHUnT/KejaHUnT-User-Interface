import { Component, OnInit, ViewChild } from '@angular/core';
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
export class StepperComponent implements OnInit {

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

  get addTenantForm(): AbstractControl {
    return this.addTenant?.form ?? new FormGroup({});
  }

  submitTenantAndContinue(): void {
    if (!this.addTenant?.form?.valid) {
      this.addTenant?.form?.markAllAsTouched();
      return;
    }

    this.addTenant.submitTenant(() => {
      this.tenantId = this.addTenant?.tenantId ?? 0;
      localStorage.setItem('tenantId', this.tenantId.toString());

      // Initialize booking step WITH stepper reference
      this.createBooking?.initialize(this.unitId, this.tenantId);
      this.createBooking!.stepper = this.stepper;

      this.stepper.next();
    });
  }

  submitPaymentStep(): void {
    this.paymentStep?.submitPayment();
  }

  resetToEdit(): void {
    this.stepper.reset();
    this.stepper.selectedIndex = 0;
  }
}
