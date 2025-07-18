import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, AbstractControl } from '@angular/forms';
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

  @ViewChild('addTenant') addTenant?: AddTenantStepComponent;
  @ViewChild('createBooking') createBooking?: CreateBookingStepComponent;
  @ViewChild('paymentStep') paymentStep?: PaymentStepComponent;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = +params['unitId'];
      const amount = +params['amount'];

      if (id && !isNaN(id)) {
        this.unitId = id;
      } else {
        console.warn('Missing or invalid unitId in query params.');
      }

      if (amount && !isNaN(amount)) {
        this.paymentAmount = amount;
      } else {
        console.warn('Missing or invalid amount in query params.');
      }
    });
  }

  get addTenantForm(): AbstractControl {
    return this.addTenant?.form ?? new FormGroup({});
  }

  get isFormInvalid(): boolean {
    return this.addTenant?.form?.invalid ?? true;
  }

  submitTenantAndContinue(stepper: any): void {
    if (this.addTenant?.form?.valid) {
      this.addTenant.submitTenant(() => {
        this.tenantId = this.addTenant?.tenantId ?? 0;
        localStorage.setItem('tenantId', this.tenantId.toString());

        this.createBooking?.initialize(this.unitId, this.tenantId);
        stepper.next();
      });
    } else {
      this.addTenant?.form?.markAllAsTouched();
    }
  }

  submitPaymentStep(): void {
    if (this.paymentStep) {
      this.paymentStep.submitPayment();
    }
  }

  resetToEdit(stepper: any): void {
    stepper.reset();
    stepper.selectedIndex = 0;

    // Re-enable and refresh form
    if (this.addTenant?.form) {
      Object.values(this.addTenant.form.controls).forEach(control => {
        if (control.disabled) control.enable();
      });
      this.addTenant.refreshTenantDetails?.();
    }
  }
}
