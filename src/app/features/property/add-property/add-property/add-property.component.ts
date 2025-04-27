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
  selectedImageFile: File | null = null;
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }

  onFormSubmit(): void {
    const formData = new FormData();
    
    formData.append('name', this.model.name);
    formData.append('location', this.model.location);
    formData.append('type', this.model.type);
  
    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }
  
    formData.append('units', JSON.stringify(this.model.units));
  
    this.propertyService.createProperty(formData)
      .subscribe({
        next: (response) => {
          this.router.navigateByUrl('admin/property');
        }
      });
      console.log(this.model);
  }
  
 
}
