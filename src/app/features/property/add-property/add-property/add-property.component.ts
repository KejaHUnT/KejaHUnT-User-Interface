import { Component, OnInit } from '@angular/core';
import { AddPropertyRequest } from '../../models/add-property-request.model';
import { PropertyService } from '../../services/property.service';
import { Router } from '@angular/router';
import { CreateUnitRequest } from '../../models/create-unit-request.model';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent {
  
  model: AddPropertyRequest;

  constructor (private propertyService: PropertyService,
    private router: Router
  )
  {
    this.model = {
      name: '',
      type: '',
      location: '',
      units: [] as CreateUnitRequest[],
    }

  }

  onFormSubmit(): void {
    console.log(this.model);
    this.propertyService.createProperty(this.model)
    .subscribe({
      next: (response) => {
        this.router.navigateByUrl('admin/property');
      }
    })
  }
 
}
