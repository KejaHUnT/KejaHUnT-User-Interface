import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStepComponent } from './create-payment-step.component';

describe('CreatePaymentStepComponent', () => {
  let component: PaymentStepComponent;
  let fixture: ComponentFixture<PaymentStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentStepComponent]
    });
    fixture = TestBed.createComponent(PaymentStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
