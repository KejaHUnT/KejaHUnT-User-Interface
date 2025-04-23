import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit {
  id: string | null = null;
  model?: Property;

  routeSubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  
    constructor(private route: ActivatedRoute,
      private propertyService: PropertyService,
      private router: Router
    ) { }
      
    ngOnInit(): void {
      this.route.paramMap.subscribe({
        next: (params) => {
          this.id = params.get('id');
    
          // Get property from api
          if(this.id) {
            this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.id).subscribe({
              next: (response) => {
                this.model = response;
                if (!this.model.units) {
                  this.model.units = [];
                }
              }
            });
          }
        }
      });    
      
    }
    

}
