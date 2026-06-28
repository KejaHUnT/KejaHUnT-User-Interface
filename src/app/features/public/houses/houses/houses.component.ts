import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.css'],
})
export class HousesComponent implements OnInit, OnDestroy {
  properties$?: Observable<Property[]>;
  searchTerm = '';
  selectedType = '';
  private subscriptions = new Subscription();
  private allProperties: Property[] = [];
  constructor(
    private propertyService: PropertyService,
  ) {}
  ngOnInit(): void {
    this.properties$ = this.propertyService
      .getAllProperties()
      .pipe(
        map((properties) =>
          properties.filter((p) => p.units && p.units.length > 0),
        ),
      );
    const sub = this.properties$.subscribe({
      next: (properties) => {
        this.allProperties = properties;
      },
      error: (err) => console.error('Error fetching properties', err),
    });
    this.subscriptions.add(sub);
  }
  get filteredProperties(): Property[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.allProperties.filter((property) => {
      const matchesTerm =
        !term ||
        property.location?.toLowerCase().includes(term) ||
        property.name?.toLowerCase().includes(term);
      const matchesType =
        !this.selectedType || property.type === this.selectedType;
      return matchesTerm && matchesType;
    });
  }
  get propertyTypes(): string[] {
    const types = this.allProperties.map((p) => p.type).filter(Boolean);
    return Array.from(new Set(types));
  }
  getMinPrice(units: Unit[]): number {
    if (!units?.length) return 0;
    return Math.min(...units.map((unit) => unit.price));
  }
  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}