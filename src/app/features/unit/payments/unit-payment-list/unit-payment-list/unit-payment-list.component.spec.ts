import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitPaymentListComponent } from './unit-payment-list.component';

describe('UnitPaymentListComponent', () => {
  let component: UnitPaymentListComponent;
  let fixture: ComponentFixture<UnitPaymentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitPaymentListComponent]
    });
    fixture = TestBed.createComponent(UnitPaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
