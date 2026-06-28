import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Property } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  id: string | null = null;
  deletePropertySubscription?: Subscription

  properties$?: Observable<Property[]>;

  constructor (private propertyService: PropertyService,
    private router: Router,
  ) {}
  

  ngOnInit(): void {
    this.properties$ = this.propertyService.getPropertiesForLoggedInUser();
  }

  navigateToProperty(propertyId: number) {
    this.router.navigate(['/admin/property', propertyId]);
  }
  
  goToManageUnits(propertyId: number): void {
    this.router.navigate([`/manage/${propertyId}/units`]);
  }

trackByPropertyId(index: number, property: Property): number {
  return property.id;
}

onDelete(id: string): void {
  if (id) {
    this.deletePropertySubscription = this.propertyService.deleteProperty(id).subscribe({
      next: () => {
        this.properties$ = this.propertyService.getPropertiesForLoggedInUser();
      },
      error: (error) => {
        console.error('Error deleting property:', error);
      }
    });
  }
}

  ngOnDestroy(): void {
    this.deletePropertySubscription?.unsubscribe();
  }
}