import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Property } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  id: string | null = null;
  deletePropertySubscription?: Subscription
  getFileByDocumentIdSubscription?: Subscription;

  properties$?: Observable<Property[]>;
  imageUrls: { [propertyId: string]: string } = {}; // Object to hold image URLs for each property

  constructor (private propertyService: PropertyService,
    private router: Router,
    private imageService: ImageService, // Inject the FileHandlerService
  ) {}
  

  ngOnInit(): void {
    this.properties$ = this.propertyService.getAllProperties();

    // Subscribe to the property observable and fetch images for each property
    this.properties$.subscribe({
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

  onDelete(id: string): void {
    if (id) {
      this.deletePropertySubscription = this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          // Refresh the property list
          this.properties$ = this.propertyService.getAllProperties();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
        }
      });
    }
  }

  navigateToProperty(propertyId: number) {
    this.router.navigate(['/admin/property', propertyId]);
  }
  
  goToEditUnit(unitId: number): void {
    this.router.navigate(['/unit', unitId]);
  }
  

  ngOnDestroy(): void {
    this.deletePropertySubscription?.unsubscribe();
    this.getFileByDocumentIdSubscription?.unsubscribe();

  }
}
