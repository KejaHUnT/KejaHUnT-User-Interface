import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-manager-portal',
  templateUrl: './manager-portal.component.html',
  styleUrls: ['./manager-portal.component.css']
})
export class ManagerPortalComponent {
  Property$?: Observable<Property[]>;
  propertiesIncome: { [key: string]: number } = {}; // Store income per property by property ID
  totalExpectedIncome: number = 0; // Store the total expected income for all properties

  constructor(private route: ActivatedRoute,
    private propertyService: PropertyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.Property$ = this.propertyService.getAllProperties();
    // Calculate the expected income after fetching the properties
    this.Property$.subscribe(properties => {
      this.calculateIncome(properties);
    });
  }

  // Function to calculate income per property and total income
  calculateIncome(properties: Property[]): void {
    let totalIncome = 0;

    properties.forEach(property => {
      let propertyIncome = 0;

      property.units.forEach(unit => {
        propertyIncome += unit.price; // Calculate income for each unit
      });

      // Store income for each property by property name or ID
      this.propertiesIncome[property.name] = propertyIncome;

      // Add property income to total income
      totalIncome += propertyIncome;
    });

    // Update total expected income
    this.totalExpectedIncome = totalIncome;
  }

}
