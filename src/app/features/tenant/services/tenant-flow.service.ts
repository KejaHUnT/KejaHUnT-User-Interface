import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TenantFlowService {

  private tenantSubject = new BehaviorSubject<any | null>(null);

  // Expose tenant as Observable for components to subscribe
  tenant$: Observable<any | null> = this.tenantSubject.asObservable();

  // Set tenant (called from Step 1)
  setTenant(tenant: any): void {
    this.tenantSubject.next(tenant);
  }

  // Get current tenant synchronously
  getTenant(): any | null {
    return this.tenantSubject.value;
  }

  // Clear tenant (optional)
  clear(): void {
    this.tenantSubject.next(null);
  }
}
