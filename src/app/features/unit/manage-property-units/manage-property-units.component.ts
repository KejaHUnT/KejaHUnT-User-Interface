import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../services/unit.service';
import { Unit } from '../../property/models/unit.model';
import { Property } from '../../property/models/property.model';
import { PropertyService } from '../../property/services/property.service';

@Component({
  selector: 'app-manage-property-units',
  templateUrl: './manage-property-units.component.html',
  styleUrls: ['./manage-property-units.component.css']
})
export class ManagePropertyUnitsComponent implements OnInit, OnDestroy {
  units: Unit[] = [];
  propertyId!: number;
  property?: Property;
  loading: boolean = false;
  subscription!: Subscription;

  // Map to store image URLs per unit
  unitImages: { [unitId: number]: string } = {};

  constructor(
    private unitService: UnitService,
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      this.propertyId = +params['propertyId'];
      this.loadProperty();
      this.loadUnits();
    });
  }

  /** Fetch property details by ID */
  loadProperty(): void {
    this.propertyService.getPopertyById(this.propertyId.toString()).subscribe({
      next: (property) => {
        this.property = property;
      },
      error: (err) => {
        console.error('Error fetching property details', err);
      }
    });
  }

  /** Load units for the current property and their images */
  loadUnits(): void {
    this.loading = true;
    this.unitService.getAllUnits().subscribe({
      next: (units) => {
        this.units = units.filter(u => u.propertyId === this.propertyId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading units', err);
        this.loading = false;
      }
    });
  }

  /** Edit a unit */
  onEdit(unit: Unit): void {
    this.router.navigate([`/unit/${unit.id}`]);
  }

  /** Delete a unit */
  onDelete(unit: Unit): void {
    if (confirm(`Are you sure you want to delete unit ${unit.doorNumber}?`)) {
      this.unitService.deleteUnit(unit.id.toString()).subscribe({
        next: () => {
          this.units = this.units.filter(u => u.id !== unit.id);
        },
        error: (err) => {
          console.error('Error deleting unit', err);
        }
      });
    }
  }

  /** Add new unit for this property */
  onAddUnit(): void {
    this.router.navigate(['/add-unit'], {
      queryParams: { propertyId: this.propertyId }
    });
  }

/** Toggle price visibility in public listing */
  toggleShowPrice(): void {
    if (!this.property) return;
    this.property.showPrice = !this.property.showPrice;

    this.propertyService.updateShowPrice(this.propertyId, this.property.showPrice).subscribe({
      next: () => console.log('ShowPrice updated'),
      error: (err) => {
        console.error('Failed to update showPrice', err);
        // Revert on failure
        this.property!.showPrice = !this.property!.showPrice;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
