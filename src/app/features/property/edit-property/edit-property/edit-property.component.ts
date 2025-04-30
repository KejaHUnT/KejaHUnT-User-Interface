import { Component, OnDestroy, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';
import { catchError, forkJoin, Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { UpdatePropertyRequest } from '../../models/update-property-request.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';

@Component({
  selector: 'app-edit-property',
  templateUrl: './edit-property.component.html',
  styleUrls: ['./edit-property.component.css']
})
export class EditPropertyComponent implements OnInit, OnDestroy {
  id: string | null = null;
  selectedImageFile: File | null = null;
  model?: Property;
  unitImageFiles: { [index: number]: File } = {};
  message: string = '';
  propertyId: string = '';

  routeSubscription?: Subscription;
  updatePropertySubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  deletePropertySubscription?: Subscription;

  constructor(private route: ActivatedRoute,
    private unitService: UnitService,
    private propertyService: PropertyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');
        if (this.id) {
          this.propertyId = this.id;
          this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.id).subscribe({
            next: (response) => {
              this.model = response;
              if (!this.model.units) {
                this.model.units = [];
              }
            },
            error: (err) => console.error('Failed to fetch property', err)
          });
        }
      }
    });
  }

  // Handle image file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
    }
  }

  // Handle unit image selection
  onUnitFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.unitImageFiles[index] = input.files[0];
    }
  }

  // Submit form to update property and units
  onFormSubmit(): void {
    if (!this.model) return;
  
    const propertyFormData = new FormData();
    propertyFormData.append('name', this.model.name);
    propertyFormData.append('location', this.model.location);
    propertyFormData.append('type', this.model.type);
  
    if (this.selectedImageFile) {
      propertyFormData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }
  
    this.propertyService.updateProperty(this.propertyId, propertyFormData).subscribe({
      next: (propertyResponse) => {
        const unitRequests: Observable<any>[] = [];
  
        this.model?.units.forEach((unit, index) => {
          const unitFormData = new FormData();
  
          const unitDto = {
            price: unit.price,
            type: unit.type,
            bathrooms: unit.bathrooms,
            size: unit.size,
            floor: unit.floor,
            doorNumber: unit.doorNumber,
            status: unit.status,
            propertyId: this.propertyId,
            documentId: unit.documentId || null
          };
  
          // Wrap the unitDto in an array
          const unitArray = [unitDto]; // Now it's an array
  
          // Send the unit array to the backend
          unitFormData.append('Units', JSON.stringify(unitArray)); // Ensure it's sent as an array
  
          const imageFile = this.unitImageFiles[index];
          if (imageFile) {
            unitFormData.append('ImageFile', imageFile, imageFile.name);
          }
  
          const request$ = (unit.id === 0 || !unit.id)
            ? this.unitService.createUnit(unitFormData)
            : this.unitService.updateUnit(unit.id.toString(), unitFormData);
  
          unitRequests.push(
            request$.pipe(
              catchError((err) => {
                console.error(`Error processing unit with ID ${unit.id || 'new'}:`, err);
                return of(null);
              })
            )
          );
        });
  
        forkJoin(unitRequests).subscribe({
          next: (results) => {
            console.log('Units processed:', results);
            this.message = 'Property and units updated successfully!';
            this.router.navigateByUrl('admin/property');
          },
          error: (err) => {
            console.error('Unit processing error:', err);
            this.message = 'Some units may have failed to update.';
          }
        });
      },
      error: (err) => {
        console.error('Failed to update property:', err);
        this.message = 'Failed to update property.';
      }
    });
  
    console.log('Final model sent:', this.model);
  }
  

  // Add a new empty unit to the form
  addUnit(): void {
    if (this.model) {
      this.model.units.push({
        id: 0,
        price: 0,
        type: '',
        bathrooms: 0,
        size: 0,
        floor: 1,
        doorNumber: '',
        status: 'Available',
        propertyId: this.model.id || 0,
        documentId: null
      });
    }
  }

  removeUnit(index: number): void {
    if (this.model) {
      this.model.units.splice(index, 1);
      delete this.unitImageFiles[index];
    }
  }


  onDelete(): void {
    if (this.id) {
      this.deletePropertySubscription = this.propertyService.deleteProperty(this.id).subscribe({
        next: () => this.router.navigateByUrl('admin/property'),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updatePropertySubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
    this.deletePropertySubscription?.unsubscribe();
  }

}
