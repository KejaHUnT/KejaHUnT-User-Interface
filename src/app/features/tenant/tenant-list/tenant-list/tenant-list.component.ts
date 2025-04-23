import { Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Tenant } from '../../models/tenant.model';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.css']
})
export class TenantListComponent {
  id: string | null = null;
    deleteTenantSubscription?: Subscription
  
    tenants$?: Observable<Tenant[]>;

    constructor (private tenantService: TenantService) {}

    ngOnInit(): void {
      this.tenants$ = this.tenantService.getAllTenants();
    }

}
