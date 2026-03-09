import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Property } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-dashboard',
  templateUrl: './property-dashboard.component.html',
  styleUrls: ['./property-dashboard.component.css']
})
export class PropertyDashboardComponent implements OnInit {

  property!: Property;
  selectedTab: string = 'overview';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) { }

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');

    if (propertyId) {
      this.propertyService.getPopertyById(propertyId)
        .subscribe({
          next: (response) => {
            this.property = response;
          },
          error: (err) => {
            console.error('Error fetching property', err);
          }
        });
    }
  }

  onTabSelected(tab: string) {
    this.selectedTab = tab;
    this.closeSidebar(); // auto close on mobile
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}