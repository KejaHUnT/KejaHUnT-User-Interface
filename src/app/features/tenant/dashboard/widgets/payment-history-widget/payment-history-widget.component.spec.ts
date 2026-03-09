import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryWidgetComponent } from './payment-history-widget.component';

describe('PaymentHistoryWidgetComponent', () => {
  let component: PaymentHistoryWidgetComponent;
  let fixture: ComponentFixture<PaymentHistoryWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentHistoryWidgetComponent]
    });
    fixture = TestBed.createComponent(PaymentHistoryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
