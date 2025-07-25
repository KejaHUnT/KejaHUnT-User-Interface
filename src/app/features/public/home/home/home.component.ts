import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { ImageService } from 'src/app/features/shared/images/service/image.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  Property$?: Observable<Property[]>;
  imageUrls: { [propertyId: string]: string } = {}; // Object to hold image URLs for each property
  getFileByDocumentIdSubscription?: Subscription;

  constructor(private propertyService: PropertyService,
    private imageService: ImageService, // Inject the FileHandlerService
  ) { }


  ngOnInit(): void {
    // Fetch all properties
    this.Property$ = this.propertyService.getAllProperties();

    // Subscribe to the property observable and fetch images for each property
    this.Property$.subscribe({
      next: (properties) => {
        properties.forEach(property => {
          if (property.documentId) {
            // Fetch image for property if documentId exists
            this.getFileByDocumentIdSubscription = this.imageService.getFileByDocumentId(property.documentId).subscribe({
              next: (fileResponse: FileResponse) => {
                if (fileResponse.base64) {
                  // Build image URL from base64 response
                  this.imageUrls[property.id] = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                }
              },
              error: (err) => {
                console.error('Error fetching image from FileHandler API', err);
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error fetching properties', err);
      }
    });
  }

  getMinPrice(units: Unit[]): number {
    return Math.min(...units.map(unit => unit.price));
  }

  hasFeatures(property: Property): boolean {
    return (property.generalFeatures?.length > 0) ||
      (property.indoorFeatures?.length > 0) ||
      (property.outDoorFeatures?.length > 0);
  }

  getTotalFeatures(property: Property): number {
    return (property.generalFeatures?.length || 0) +
      (property.indoorFeatures?.length || 0) +
      (property.outDoorFeatures?.length || 0);
  }

  ngOnDestroy(): void {
    this.getFileByDocumentIdSubscription?.unsubscribe();
    this.Property$?.subscribe().unsubscribe();
  }

}
