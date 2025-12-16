import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from '../services/unit.service';
import { Unit } from '../../property/models/unit.model';
import { Property } from '../../property/models/property.model';
import { PropertyService } from '../../property/services/property.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';

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
    private imageService: ImageService,
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

        // Fetch images for each unit
        this.units.forEach(unit => {
          if (unit.documentId) {
            this.imageService.getFileByDocumentId(unit.documentId).subscribe({
              next: (fileResponse: FileResponse) => {
                this.unitImages[unit.id] = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
              },
              error: (err) => {
                console.error(`Failed to fetch image for unit ${unit.id}`, err);
              }
            });
          }
        });
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
          delete this.unitImages[unit.id];
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

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
