import { TestBed } from '@angular/core/testing';

import { TenantFlowService } from './tenant-flow.service';

describe('TenantFlowService', () => {
  let service: TenantFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
