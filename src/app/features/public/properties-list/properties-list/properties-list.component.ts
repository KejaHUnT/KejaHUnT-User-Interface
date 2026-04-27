import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Property } from 'src/app/features/property/models/property.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';

@Component({
  selector: 'app-properties-list',
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.css']
})
export class PropertiesListComponent implements OnInit, OnDestroy {

  properties$?: Observable<Property[]>;
  propertySubscription?: Subscription;
  imageSubscriptions: Subscription[] = [];

  imageUrls: { [propertyId: string]: string } = {};

  // FILTER STATE
  filters = {
    location: '',
    type: '',
    minPrice: 0,
    maxPrice: 1000000
  };

  constructor(
    private propertyService: PropertyService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {

    this.properties$ = this.propertyService.getAllProperties().pipe(
      map(properties =>
        properties
          // Only properties WITH units
          .filter(p => p.units && p.units.length > 0)

          // Apply filters
          .filter(p => {
            const matchesLocation =
              !this.filters.location ||
              p.location.toLowerCase().includes(this.filters.location.toLowerCase());

            const matchesType =
              !this.filters.type || p.type === this.filters.type;

            const minPrice = this.getMinPrice(p.units);

            const matchesPrice =
              minPrice >= this.filters.minPrice &&
              minPrice <= this.filters.maxPrice;

            return matchesLocation && matchesType && matchesPrice;
          })
      )
    );

    this.propertySubscription = this.properties$.subscribe({
      next: (properties) => {
        properties.forEach(property => {
          if (property.documentId && !this.imageUrls[property.id]) {
            const sub = this.imageService
              .getFileByDocumentId(property.documentId)
              .subscribe({
                next: (res: FileResponse) => {
                  if (res.base64) {
                    this.imageUrls[property.id] =
                      `data:image/${res.extension.replace('.', '')};base64,${res.base64}`;
                  }
                }
              });

            this.imageSubscriptions.push(sub);
          }
        });
      }
    });
  }

  //  Trigger filter refresh
  applyFilters() {
    this.ngOnInit();
  }

  getMinPrice(units: Unit[]): number {
    return Math.min(...units.map(u => u.price));
  }

  ngOnDestroy(): void {
    this.propertySubscription?.unsubscribe();
    this.imageSubscriptions.forEach(s => s.unsubscribe());
  }
}