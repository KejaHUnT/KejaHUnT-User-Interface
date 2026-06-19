import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Property } from 'src/app/features/property/models/property.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-properties-list',
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.css']
})
export class PropertiesListComponent implements OnInit, OnDestroy {

  properties$?: Observable<Property[]>;
  propertySubscription?: Subscription;

  filters = {
    location: '',
    type: '',
    minPrice: 0,
    maxPrice: 1000000
  };

  constructor(
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.properties$ = this.propertyService.getAllProperties().pipe(
      map(properties =>
        properties
          // 1. Hide occupied units
          .map(p => ({
            ...p,
            units: p.units.filter(u => u.status !== 'Occupied')
          }))
          // 2. Remove properties with no visible units
          .filter(p => p.units && p.units.length > 0)
          // 3. Apply location/type/price filters
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
  }

  applyFilters() {
    this.ngOnInit();
  }

  getMinPrice(units: Unit[]): number {
    return Math.min(...units.map(u => u.price));
  }

  ngOnDestroy(): void {
    this.propertySubscription?.unsubscribe();
  }
}