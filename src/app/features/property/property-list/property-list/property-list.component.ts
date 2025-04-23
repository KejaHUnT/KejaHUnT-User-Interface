import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Property } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  id: string | null = null;
  deletePropertySubscription?: Subscription

  properties$?: Observable<Property[]>;

  constructor (private propertyService: PropertyService) {}
  

  ngOnInit(): void {
    this.properties$ = this.propertyService.getAllProperties();
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

  ngOnDestroy(): void {
    this.deletePropertySubscription?.unsubscribe();
  }

}
