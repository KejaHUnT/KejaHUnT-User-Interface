
import { AfterViewInit, Component } from '@angular/core';
import { AddTenantRequest } from '../../models/add-tenant-request.model';
import { TenantService } from '../../services/tenant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateUnitRequest } from 'src/app/features/property/models/create-unit-request.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { Property } from 'src/app/features/property/models/property.model';
import { Observable } from 'rxjs';
import * as bootstrap from 'bootstrap';
import { UnitService } from 'src/app/features/unit/services/unit.service';

@Component({
  selector: 'app-add-tenant',
  templateUrl: './add-tenant.component.html',
  styleUrls: ['./add-tenant.component.css']
})
export class AddTenantComponent implements AfterViewInit {
  id: string | null = null;
  property?: Property;

  selectedProperty?: Property;
  selectedUnit?: CreateUnitRequest; // store fetched unit details

  model: AddTenantRequest;
  Property$?: Observable<Property[]>;

  constructor(private tenantService: TenantService,
    private propertyService: PropertyService,
    private unitService: UnitService,
    private router: Router,
    private route: ActivatedRoute

  ) {
    this.model = {
      fullName: '',
      phoneNumber: '',
      idNo: 0,
      email: '',
      employer: '',
      unitId: 0,
      createdBy: '',
    }
  }
  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.Property$ = this.propertyService.getAllProperties();

    // Read query params
    this.route.queryParams.subscribe((params) => {
      const unitId = params['unitId'];

      if (unitId) {
        // Save to model
        this.model.unitId = +unitId;

        // Fetch unit details using service
        this.unitService.getUnitById(unitId).subscribe(unit => {
          this.selectedUnit = unit;

          // Optionally use unit details to display info or validate against selected property
          console.log('Fetched Unit:', unit);
        });
      }
    });
  }

  onFormSubmit(): void {
    console.log(this.model);
    this.tenantService.createTenant(this.model).subscribe({
      next: () => {
        this.router.navigateByUrl('admin/tenant');
      }
    });
  }

  openUnitModal(): void {
    // Optional: Only allow adding unit if property is selected
    if (!this.model.unitId) return;

    this.propertyService.getPopertyById(this.model.unitId.toString()).subscribe((property) => {
      this.selectedProperty = property;

      // Open Bootstrap modal
      const modal = new bootstrap.Modal(document.getElementById('unitModal')!);
      modal.show();
    });
  }

}
