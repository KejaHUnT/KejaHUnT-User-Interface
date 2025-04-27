import { Component, OnDestroy, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { UpdatePropertyRequest } from '../../models/update-property-request.model';

@Component({
  selector: 'app-edit-property',
  templateUrl: './edit-property.component.html',
  styleUrls: ['./edit-property.component.css']
})
export class EditPropertyComponent implements OnInit, OnDestroy{
  id: string | null = null;
  selectedImageFile: File | null = null;  // Track selected image file
  model?: Property;

  routeSubscription?: Subscription;
  updatePropertySubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  deletePropertySubscription?: Subscription;

  constructor(private route: ActivatedRoute,
    private propertyService: PropertyService,
    private router: Router
  ) { }

   // Handle image file selection
   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');
  
        // Get property from api
        if(this.id) {
          this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.id).subscribe({
            next: (response) => {
              this.model = response;
              if (!this.model.units) {
                this.model.units = [];
              }
            }
          });
        }
      }
    });    
    
  }

  // Handle form submission
  onFormSubmit(): void {
    // Create FormData to send to the backend
    const formData = new FormData();
    
    // Append properties to FormData
    if (this.model && this.id) {
      formData.append('name', this.model.name);
      formData.append('location', this.model.location);
      formData.append('type', this.model.type);

      // Append selected image file if exists
      if (this.selectedImageFile) {
        formData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
      }

      // Serialize units and append as JSON string
      formData.append('units', JSON.stringify(this.model.units));

      // Send update request to backend
      this.updatePropertySubscription = this.propertyService.updateProperty(this.id, formData).subscribe({
        next: (response) => {
          this.router.navigateByUrl('admin/property');
        }
      });
    }
  }


    // Add a new empty unit to the form
    addUnit(): void {
      if (this.model) {
        this.model.units.push({
          price: 0,
          type: '',
          bathrooms: 0,
          size: 0,
          noOfUnits: 1
        });
      }
    }

    removeUnit(index: number): void {
      if (this.model) {
        this.model.units.splice(index, 1);
      }
    }

    onDelete(): void {
      if (this.id) {
        //call seervice to delete
        this.deletePropertySubscription = this.propertyService.deleteProperty(this.id).subscribe({
          next: (response) => {
            this.router.navigateByUrl('admin/property');
          }
        });
      }
    }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updatePropertySubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
    this.deletePropertySubscription?.unsubscribe();}

}
