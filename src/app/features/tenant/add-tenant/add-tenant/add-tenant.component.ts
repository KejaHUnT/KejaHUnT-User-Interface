
import { AfterViewInit, Component } from '@angular/core';
import { AddTenantRequest } from '../../models/add-tenant-request.model';
import { TenantService } from '../../services/tenant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateUnitRequest } from 'src/app/features/property/models/create-unit-request.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { Property } from 'src/app/features/property/models/property.model';
import { Observable } from 'rxjs';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-add-tenant',
  templateUrl: './add-tenant.component.html',
  styleUrls: ['./add-tenant.component.css']
})
export class AddTenantComponent implements AfterViewInit {
  id: string | null = null;
  property?: Property;

  selectedProperty?: Property;
  filteredUnits: CreateUnitRequest[] = [];

  model: AddTenantRequest;
  Property$?: Observable<Property[]>;

  constructor (private tenantService: TenantService,
    private propertyService: PropertyService,
      private router: Router,
      private route: ActivatedRoute
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
  ngAfterViewInit(): void {

  }

    ngOnInit(): void {

      this.Property$ = this.propertyService.getAllProperties();
      

      // Retrieve propertyId and unit details from the query params
      this.route.queryParams.subscribe((params) => {
        if (params['propertyId']) {
          this.model.propertyId = params['propertyId'];
        }
        if (params['unitSize'] && params['unitType']) {
          this.model.units.push({
            size: +params['unitSize'],
            type: params['unitType'],
            price: +params['unitRent'],
            noOfUnits: 1,
            bathrooms: params['unitBathrooms']
          });
        }
      });
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
  
    addNewUnit(): void {
      this.model.units.push({ price: 0, type: '', bathrooms: 0, size: 0, noOfUnits: 1 });
    }
  
    removeUnit(index: number): void {
      this.model.units.splice(index, 1);
    }

    onBookNow(unit: any, propertyId: number): void {
      this.router.navigate(['/admin/tenant/add'], {
        queryParams: {
          propertyId: propertyId,
          unitType: unit.type,
          unitSize: unit.size,
          unitNo: unit.noOfUnits,
          unitRent: unit.price,
          unitBathrooms: unit.bathrooms
        }
      });
    }

    addUnitToTenant(unit: CreateUnitRequest): void {
      this.model.units.push({ ...unit, noOfUnits: 1 });
    
      // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('unitModal')!);
  modal?.hide();
    }

    openUnitModal(): void {
      this.propertyService.getPopertyById(this.model.propertyId.toString()).subscribe((property) => {
        this.selectedProperty = property;
    
        // Filter out units already selected
        const selectedTypes = this.model.units.map(u => u.type + u.size);
        this.filteredUnits = property.units.filter(unit =>
          !selectedTypes.includes(unit.type + unit.size)
        );
    
        // Open modal (using Bootstrap JS API)
    const modal = new bootstrap.Modal(document.getElementById('unitModal')!);
    modal.show();
      });
    }

    
    
    
}
