import { TestBed } from '@angular/core/testing';

import { PaystackPaymentService } from './paystack-payment.ts.service';

describe('PaystackPaymentServiceTsService', () => {
  let service: PaystackPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaystackPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
