import { TestBed } from '@angular/core/testing';

import { PropertyPaymentDetailsService } from './property-payment-details.service';

describe('PropertyPaymentDetailsService', () => {
  let service: PropertyPaymentDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyPaymentDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
