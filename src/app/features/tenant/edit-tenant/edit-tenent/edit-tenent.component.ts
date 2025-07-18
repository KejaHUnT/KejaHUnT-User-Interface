import { Component, OnDestroy, OnInit } from '@angular/core';
import { Tenant } from '../../models/tenant.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '../../services/tenant.service';
import { UpdateTenantRequest } from '../../models/update-tenant-request.model';

@Component({
  selector: 'app-edit-tenent',
  templateUrl: './edit-tenent.component.html',
  styleUrls: ['./edit-tenent.component.css']
})
export class EditTenentComponent implements OnInit, OnDestroy{
  id: string | null = null;
    model?: Tenant;

    routeSubscription?: Subscription;
      updateTenantSubscription?: Subscription;
      getTenantByIdSubscription?: Subscription;
      deleteTenantSubscription?: Subscription;

      constructor(private route: ActivatedRoute,
          private tenantService: TenantService,
          private router: Router
        ) { }

        ngOnInit(): void {
          this.route.paramMap.subscribe({
            next: (params) => {
              this.id = params.get('id');
        
              // Get property from api
              if(this.id) {
                this.getTenantByIdSubscription = this.tenantService.getTenantById(this.id).subscribe({
                  next: (response) => {
                    this.model = response;
                    if (!this.model.unitId) {
                      this.model.unitId = 0;
                    }
                  }
                });
              }
            }
          });    
          
        }

  onFormSubmit(): void {
      //convert model to a request method
      if (this.model && this.id) {
        var updateProperty: UpdateTenantRequest = {
          fullName: this.model.fullName,
          phoneNumber: this.model.phoneNumber,
          email: this.model.email,
          idNo: this.model.idNo,
          employer: this.model.employer,
          unitId: this.model.unitId,
          updatedAt: new Date(),
          updatedBy: 'admin'
        };
  
        this.updateTenantSubscription = this.tenantService.updateTenant(this.id, updateProperty).subscribe({
          next: (response) => {
            this.router.navigateByUrl('admin/tenant');
          }
        });
  
      }
    }

    onDelete(): void {
      if (this.id) {
        //call seervice to delete
        this.deleteTenantSubscription = this.tenantService.deleteTenant(this.id).subscribe({
          next: (response) => {
            this.router.navigateByUrl('admin/tenant');
          }
        });
      }
    }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updateTenantSubscription?.unsubscribe();
    this.getTenantByIdSubscription?.unsubscribe();
    this.deleteTenantSubscription?.unsubscribe();

  }
        

}
