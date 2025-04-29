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
  unitImageFiles: { [index: number]: File } = {}; // Track image file per unit

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

  // Handle unit image selection
  onUnitFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.unitImageFiles[index] = input.files[0];
    }
  }

  // Handle form submission
  onFormSubmit(): void {
    if (this.model && this.id) {
      const formData = new FormData();

      formData.append('name', this.model.name);
      formData.append('location', this.model.location);
      formData.append('type', this.model.type);
      if (this.model.documentId) {
        formData.append('documentId', this.model.documentId);
      } else {
        formData.append('documentId', '');  // or append 'null' if that's expected
      }

      if (this.selectedImageFile) {
        formData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
      }

      // Prepare units without the image files
      const unitsData = this.model.units.map((unit, index) => {
        return {
          id: unit.id, // optional if exists
          price: unit.price,
          type: unit.type,
          bathrooms: unit.bathrooms,
          size: unit.size,
          noOfUnits: unit.noOfUnits,
          documentId: unit.documentId || null // optional if exists
        };
      });

      // Append serialized units
      formData.append('units', JSON.stringify(unitsData));

      // Attach unit images separately
      for (const [index, file] of Object.entries(this.unitImageFiles)) {
        formData.append(`Units[${index}].ImageFile`, file, file.name);
        console.log(`Units[${index}].ImageFile`, file);
      }

      this.updatePropertySubscription = this.propertyService.updateProperty(this.id, formData).subscribe({
        next: () => {
          this.router.navigateByUrl('admin/property');
        }
      });
    }
  }


    // Add a new empty unit to the form
    addUnit(): void {
      if (this.model) {
        this.model.units.push({
          id: 0, // optional if exists
          price: 0,
          type: '',
          bathrooms: 0,
          size: 0,
          noOfUnits: 1,
          documentId: null // optional if exists
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
