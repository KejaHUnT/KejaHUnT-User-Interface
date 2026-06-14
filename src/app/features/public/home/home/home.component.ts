import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { Unit } from 'src/app/features/property/models/unit.model';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  Property$?: Observable<Property[]>;

  private subscriptions = new Subscription();

  constructor(
    private propertyService: PropertyService,
  ) {}

  ngOnInit(): void {
    this.Property$ = this.propertyService
      .getAllProperties()
      .pipe(
        map((properties) =>
          properties.filter((p) => p.units && p.units.length > 0),
        ),
      );

    const sub = this.Property$.subscribe({
      error: (err) => console.error('Error fetching properties', err),
    });
    this.subscriptions.add(sub);
  }

  getMinPrice(units: Unit[]): number {
    if (!units?.length) return 0;
    return Math.min(...units.map((unit) => unit.price));
  }

  hasFeatures(property: Property): boolean {
    return (
      property.generalFeatures?.length > 0 ||
      property.indoorFeatures?.length > 0 ||
      property.outDoorFeatures?.length > 0
    );
  }

  getTotalFeatures(property: Property): number {
    return (
      (property.generalFeatures?.length || 0) +
      (property.indoorFeatures?.length || 0) +
      (property.outDoorFeatures?.length || 0)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}