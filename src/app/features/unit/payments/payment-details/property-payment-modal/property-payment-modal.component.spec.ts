import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyPaymentModalComponent } from './property-payment-modal.component';

describe('PropertyPaymentModalComponent', () => {
  let component: PropertyPaymentModalComponent;
  let fixture: ComponentFixture<PropertyPaymentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyPaymentModalComponent]
    });
    fixture = TestBed.createComponent(PropertyPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
