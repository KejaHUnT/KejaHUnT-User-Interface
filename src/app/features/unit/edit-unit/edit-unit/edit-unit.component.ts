import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { UnitService } from '../../services/unit.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';

@Component({
  selector: 'app-edit-unit',
  templateUrl: './edit-unit.component.html',
  styleUrls: ['./edit-unit.component.css']
})
export class EditUnitComponent implements OnInit, OnDestroy {

  id: string | null = null;
  selectedImageFile: File | null = null;
  propertyImageUrl: string | null = null;
  model?: Unit;

  routeSubscription?: Subscription;
  updateUnitSubscription?: Subscription;
  getUnitByIdSubscription?: Subscription;
  deleteUnitSubscription?: Subscription;

  constructor(private route: ActivatedRoute,
    private unitService: UnitService,
    private imageService: ImageService, // Inject ImageService for fetching existing images
    private router: Router
  ) { }
  

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');
        if (this.id) {
          this.getUnitByIdSubscription = this.unitService.getUnitById(this.id).subscribe({
            next: (response) => {
              this.model = response;
              // Fetch the existing unit image (if any)
              if (this.model.documentId) {
                this.imageService.getFileByDocumentId(this.model.documentId).subscribe({
                  next: (fileResponse: FileResponse) => {
                    this.propertyImageUrl = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                  },
                  error: (err) => console.error('Failed to fetch property image', err),
                });
              }
            },
            error: (err) => console.error('Failed to fetch property', err)
          });
        }
      }
    });
  }

  // Handle image file selection for property
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.propertyImageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  onFormSubmit(): void {
    if (!this.model || this.model.id === undefined || this.model.id === null) {
      console.error('Unit model or ID is missing.');
      return;
    }
  
    // Create the list of units (currently just one)
    const updateUnitRequestList = [
      {
        id: this.model.id,
        type: this.model.type,
        price: this.model.price,
        size: this.model.size,
        bathrooms: this.model.bathrooms,
        floor: this.model.floor,
        doorNumber: this.model.doorNumber,
        status: this.model.status,
        propertyId: this.model.propertyId,
        documentId: this.model.documentId // Important: pass this for edit support
      }
    ];
  
    // Convert to JSON string
    const updateUnitJson = JSON.stringify(updateUnitRequestList);
  
    // Construct FormData
    const formData = new FormData();
    formData.append('Units', updateUnitJson);
  
    if (this.selectedImageFile) {
      formData.append('ImageFile', this.selectedImageFile, this.selectedImageFile.name);
    }
  
    // Submit the request
    this.unitService.updateUnit(this.model.id.toString(), formData).subscribe({
      next: (response) => {
        console.log('Unit updated successfully:', response);
        this.router.navigateByUrl('admin/property');
      },
      error: (err) => {
        console.error('Failed to update unit:', err);
      }
    });
  }

  onDelete(): void {
    if (this.id) {
      this.deleteUnitSubscription = this.unitService.deleteUnit(this.id).subscribe({
        next: () => this.router.navigateByUrl('admin/property'),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updateUnitSubscription?.unsubscribe();
    this.getUnitByIdSubscription?.unsubscribe();
    this.deleteUnitSubscription?.unsubscribe();
  }

}
