import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { ImageService } from 'src/app/features/shared/images/service/image.service';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit {
  id: string | null = null;
  model?: Property;
  imageUrl: string = ''; // Property to hold image URL
  unitImageUrls: { [index: number]: string } = {}; // Key: Unit index, Value: Image URL
  routeSubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  getFileByDocumentIdSubscription?: Subscription;
  
    constructor(private route: ActivatedRoute,
      private propertyService: PropertyService,
      private imageService: ImageService, // Inject the FileHandlerService
      private router: Router
    ) { }
      
    ngOnInit(): void {
      this.routeSubscription = this.route.paramMap.subscribe({
        next: (params) => {
          this.id = params.get('id');
    
          if (this.id) {
            this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.id).subscribe({
              next: (response) => {
                this.model = response;
    
                if (!this.model.units) {
                  this.model.units = [];
                }
    
                // Fetch property image
                if (this.model.documentId) {
                  this.getFileByDocumentIdSubscription = this.imageService.getFileByDocumentId(this.model.documentId).subscribe({
                    next: (fileResponse: FileResponse) => {
                      this.imageUrl = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                    },
                    error: (err) => {
                      console.error('Error fetching property image', err);
                    }
                  });
                }
    
                // 🆕 Fetch unit images
                this.model.units.forEach((unit, index) => {
                  if (unit.documentId) {
                    this.imageService.getFileByDocumentId(unit.documentId).subscribe({
                      next: (fileResponse: FileResponse) => {
                        this.unitImageUrls[index] = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                      },
                      error: (err) => {
                        console.error(`Error fetching image for unit ${index}`, err);
                      }
                    });
                  }
                });
    
              },
              error: (err) => {
                console.error('Error fetching property', err);
              }
            });
          }
        }
      });
    }
    

    onBookNow(unit: any): void {
      if (this.model) {
        const selectedPropertyId = this.model.id;
        const selectedUnitDetails = unit;
  
        // Navigate to AddTenantComponent, passing the propertyId and unit details
        this.router.navigate(['/admin/tenant/add'], {
          queryParams: {
            propertyId: selectedPropertyId,
            unitType: selectedUnitDetails.type,
            unitSize: selectedUnitDetails.size,
            unitNo: selectedUnitDetails.noOfUnits,
            unitRent: selectedUnitDetails.price,
            unitBathrooms: selectedUnitDetails.bathrooms
          }
        });
      }
    }

    ngOnDestroy(): void {
      this.routeSubscription?.unsubscribe();
      this.getPropertyByIdSubscription?.unsubscribe();
      this.getFileByDocumentIdSubscription?.unsubscribe();
    }
}
