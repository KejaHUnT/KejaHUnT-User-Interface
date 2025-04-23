import { Component, OnDestroy, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { UpdatePropertyRequest } from '../../models/update-property-request.model';

@Component({
  selector: 'app-edit-property',
  templateUrl: './edit-property.component.html',
  styleUrls: ['./edit-property.component.css']
})
export class EditPropertyComponent implements OnInit, OnDestroy{
  id: string | null = null;
  model?: Property;

  routeSubscription?: Subscription;
  updatePropertySubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  deletePropertySubscription?: Subscription;

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

  onFormSubmit(): void {
    //convert model to a request method
    if (this.model && this.id) {
      var updateProperty: UpdatePropertyRequest = {
        name: this.model.name,
        location: this.model.location,
        type: this.model.type,
        units: this.model.units.map(unit => ({
          id: unit.id,
          price: unit.price,
          type: unit.type,
          bathrooms: unit.bathrooms,
          size: unit.size,
          noOfUnits: unit.noOfUnits
        }))
      };

      this.updatePropertySubscription = this.propertyService.updateProperty(this.id, updateProperty).subscribe({
        next: (response) => {
          this.router.navigateByUrl('admin/property');
        }
      });

    }
  }

    // Add a new empty unit to the form
    addUnit(): void {
      if (this.model) {
        this.model.units.push({
          id: 0,
          price: 0,
          type: '',
          bathrooms: 0,
          size: 0,
          noOfUnits: 1
        });
      }
    }

    removeUnit(index: number): void {
      if (this.model) {
        this.model.units.splice(index, 1);
      }
    }

    onDelete(): void {
      if (this.id) {
        //call seervice to delete
        this.deletePropertySubscription = this.propertyService.deleteProperty(this.id).subscribe({
          next: (response) => {
            this.router.navigateByUrl('admin/property');
          }
        });
      }
    }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updatePropertySubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
    this.deletePropertySubscription?.unsubscribe();}

}
