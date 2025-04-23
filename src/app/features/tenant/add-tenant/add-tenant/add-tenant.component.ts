import { Component } from '@angular/core';
import { AddTenantRequest } from '../../models/add-tenant-request.model';
import { TenantService } from '../../services/tenant.service';
import { Router } from '@angular/router';
import { CreateUnitRequest } from 'src/app/features/property/models/create-unit-request.model';

@Component({
  selector: 'app-add-tenant',
  templateUrl: './add-tenant.component.html',
  styleUrls: ['./add-tenant.component.css']
})
export class AddTenantComponent {

  model: AddTenantRequest;

  constructor (private tenantService: TenantService,
      private router: Router
    ) {
      this.model = {
            fullName: '',
            phoneNumber: '',
            idNo: 0,
            email: '',
            employer: '',
            units: [] as CreateUnitRequest[],
            propertyId: 0,
            createdBy: '',
          }
    }

    onFormSubmit(): void {
      console.log(this.model);
      this.tenantService.createTenant(this.model)
      .subscribe({
        next: (response) => {
          this.router.navigateByUrl('admin/tenant');
        }
      })
    }
  

}
