import { Component } from '@angular/core';
import { AddPropertyRequest } from '../../models/add-property-request.model';
import { PropertyService } from '../../services/property.service';
import { Router } from '@angular/router';
import { CreateUnitRequest } from '../../models/create-unit-request.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent {
  selectedImageFile: File | null = null;
  model: AddPropertyRequest;
  message: string = '';

  constructor(
    private propertyService: PropertyService,
    private unitService: UnitService,
    private router: Router
  ) {
    this.model = {
      name: '',
      type: '',
      location: '',
      units: []
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }

  // ✅ Add this: Bind unit image file on change
  onUnitImageSelected(event: Event, unitIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.model.units[unitIndex].imageFile = input.files[0]; // Custom property
    }
  }


  onFormSubmit(): void {
    const propertyFormData = new FormData();
  
    // Basic property info
    propertyFormData.append('name', this.model.name);
    propertyFormData.append('location', this.model.location);
    propertyFormData.append('type', this.model.type);
  
    // Optional property image
    if (this.selectedImageFile) {
      propertyFormData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }
  
    // Step 1: Create the property
    this.propertyService.createProperty(propertyFormData).subscribe({
      next: (propertyResponse) => {
        const propertyId = propertyResponse.id;
  
        // Prepare units with propertyId
        const unitsForUpload = this.model.units.map(unit => ({
          price: unit.price,
          type: unit.type,
          bathrooms: unit.bathrooms,
          size: unit.size,
          floor: unit.floor,
          doorNumber: unit.doorNumber,
          status: unit.status,
          propertyId: propertyId
        }));
  
        // Step 2: Prepare unit FormData
        const unitFormData = new FormData();
  
        // Append JSON string of units
        unitFormData.append('units', JSON.stringify(unitsForUpload));
  
        // Append each image file under 'imageFile' key (same order)
        this.model.units.forEach(unit => {
          if (unit.imageFile) {
            unitFormData.append('imageFile', unit.imageFile, unit.imageFile.name);
          } else {
            console.warn('⚠️ Unit is missing imageFile:', unit);
          }
        });
  
        // Step 3: Call unit creation API
        this.unitService.createUnit(unitFormData).subscribe({
          next: (response) => {
            console.log('✅ Units created successfully:', response);
            this.message = 'Property and units created successfully!';
            this.router.navigateByUrl('admin/property');
          },
          error: (err) => {
            console.error('❌ Error creating units:', err);
            this.message = 'Failed to create units.';
          }
        });
      },
      error: (err) => {
        console.error('❌ Property creation failed:', err);
        this.message = 'Failed to create property.';
      }
    });
  
    console.log('📦 Final model sent:', this.model);
  }
  
  
  
}
