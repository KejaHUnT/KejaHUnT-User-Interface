import { TestBed } from '@angular/core/testing';

import { NavRoutingHelperService } from './nav-routing-helper.service';

describe('NavRoutingHelperService', () => {
  let service: NavRoutingHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavRoutingHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
