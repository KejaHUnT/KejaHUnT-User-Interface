import { Component, OnInit } from '@angular/core';
import { AddPropertyRequest } from '../../models/add-property-request.model';
import { PropertyService } from '../../services/property.service';
import { Router } from '@angular/router';
import { CreateUnitRequest } from '../../models/create-unit-request.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { Observable } from 'rxjs';
import { GeneralFeatures } from '../../models/general-feature.model';
import { IndoorFeature } from '../../models/indoor-feature.model';
import { outdoorFeature } from '../../models/outdoor-feature.model';
import { Policy } from '../../models/policy.model';
import { AddPolicyDescription } from '../../models/add-policy-description.model';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent implements OnInit {
  selectedImageFile: File | null = null;
  propertyImagePreview: string | null = null;
  latestPropertyId: number | null = null;
  unitImageUrls: string[] = [];
  unitImageFiles: { [index: number]: File } = {};
  model: AddPropertyRequest;
  message: string = '';
  features$?: Observable<GeneralFeatures[]>;
  indoor$?: Observable<IndoorFeature[]>;
  outdoor$?: Observable<outdoorFeature[]>;
  policy$?: Observable<Policy[]>;
  policyDescriptions: { [policyId: number]: string[] } = {};
  newPolicyDescriptionInputs: { [policyId: number]: string } = {};

  constructor(
    private propertyService: PropertyService,
    private unitService: UnitService,
    private router: Router,
    private authService: AuthService
  ) {
    this.model = {
      name: '',
      type: '',
      location: '',
      description: '',
      email: this.authService.getLoggedInUserEmail() ?? '',  // Fetch email here
      generalFeatures: [],
      outdoorFeatures: [],
      indoorFeatures: [],
      units: []
    };
  }

  ngOnInit(): void {
    this.features$ = this.propertyService.getAllFeatures();
    this.indoor$ = this.propertyService.getAllIndoorFeatures();
    this.outdoor$ = this.propertyService.getAllOutdorrFeatures();
    this.policy$ = this.propertyService.getAllPolicies();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.propertyImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  onUnitFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.unitImageFiles[index] = file;
      this.model.units[index].imageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.unitImageUrls[index] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addUnit(): void {
    const newUnit: CreateUnitRequest = {
      price: 0,
      type: '',
      bathrooms: 0,
      size: 0,
      floor: 0,
      doorNumber: '',
      status: '',
      propertyId: 0,
    };
    this.model.units.push(newUnit);
  }

  removeUnit(index: number): void {
    if (index > -1 && index < this.model.units.length) {
      this.model.units.splice(index, 1);
    }
  }

  onFormSubmit(): void {
    const propertyFormData = new FormData();
    propertyFormData.append('name', this.model.name);
    propertyFormData.append('location', this.model.location);
    propertyFormData.append('type', this.model.type);
    propertyFormData.append('description', this.model.description);
    propertyFormData.append('email', this.model.email);

    this.model.generalFeatures.forEach(id => propertyFormData.append('generalFeatures', id.toString()));
    this.model.indoorFeatures.forEach(id => propertyFormData.append('indoorFeatures', id.toString()));
    this.model.outdoorFeatures.forEach(id => propertyFormData.append('outdoorFeatures', id.toString()));

    if (this.selectedImageFile) {
      propertyFormData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }

    this.propertyService.createProperty(propertyFormData).subscribe({
      next: (propertyResponse) => {
        const propertyId = propertyResponse.id;
        this.latestPropertyId = propertyId;

        // Create policy descriptions after property is created, using the new property ID
        this.createPolicyDescriptions(propertyId).then(() => {
          // After policy descriptions are created, handle units
          this.handleUnitsCreation(propertyId);
        }).catch(() => {
          // Even if policy descriptions fail, continue with units
          this.handleUnitsCreation(propertyId);
        });
      },
      error: () => {
        this.message = 'Failed to create property.';
      }
    });
  }

  private createPolicyDescriptions(pendingPropertyId: number): Promise<void> {
    const policyPromises: Promise<any>[] = [];

    Object.keys(this.policyDescriptions).forEach(policyIdStr => {
      const policyId = parseInt(policyIdStr);
      this.policyDescriptions[policyId].forEach(name => {
        const policyDescription: AddPolicyDescription = {
          name,
          policyId,
          pendingPropertyId // Using the propertyId from the created property
        };

        const promise = this.propertyService.addPolicyDescription(policyDescription).toPromise();
        policyPromises.push(promise);
      });
    });

    return Promise.all(policyPromises).then(() => {
      console.log('All policy descriptions created successfully');
    });
  }

  private handleUnitsCreation(propertyId: number): void {
    if (this.model.units.length > 0) {
      const unitsForUpload = this.model.units.map(unit => ({
        price: unit.price,
        type: unit.type,
        bathrooms: unit.bathrooms,
        size: unit.size,
        floor: unit.floor,
        doorNumber: unit.doorNumber,
        status: unit.status,
        propertyId: propertyId // Using the propertyId from the created property
      }));

      const unitFormData = new FormData();
      unitFormData.append('units', JSON.stringify(unitsForUpload));

      this.model.units.forEach(unit => {
        if (unit.imageFile) {
          unitFormData.append('imageFile', unit.imageFile, unit.imageFile.name);
        }
      });

      this.unitService.createUnit(unitFormData).subscribe({
        next: () => {
          this.message = 'Property, policy descriptions, and units created successfully!';
          this.router.navigateByUrl('admin/property');
        },
        error: () => {
          this.message = 'Property and policy descriptions created, but failed to add units.';
          this.router.navigateByUrl('admin/property');
        }
      });
    } else {
      this.message = 'Property and policy descriptions created successfully!';
      this.router.navigateByUrl('admin/property');
    }
  }

  onGeneralFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.model.generalFeatures = checked
      ? [...this.model.generalFeatures, featureId]
      : this.model.generalFeatures.filter(id => id !== featureId);
  }

  onIndoorFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.model.indoorFeatures = checked
      ? [...this.model.indoorFeatures, featureId]
      : this.model.indoorFeatures.filter(id => id !== featureId);
  }

  onOutdoorFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.model.outdoorFeatures = checked
      ? [...this.model.outdoorFeatures, featureId]
      : this.model.outdoorFeatures.filter(id => id !== featureId);
  }

  onSelectPolicy(policy: Policy): void {
    if (!this.policyDescriptions[policy.id]) {
      this.policyDescriptions[policy.id] = [];
      this.newPolicyDescriptionInputs[policy.id] = '';
    }
  }

  onAddPolicyDescription(policyId: number): void {
    const desc = this.newPolicyDescriptionInputs[policyId]?.trim();
    if (desc) {
      if (!this.policyDescriptions[policyId]) {
        this.policyDescriptions[policyId] = [];
      }
      this.policyDescriptions[policyId].push(desc);
      this.newPolicyDescriptionInputs[policyId] = '';
    }
  }

  removePolicyDescription(policyId: number, index: number): void {
    const descriptions = this.policyDescriptions[policyId];
    if (descriptions && index > -1 && index < descriptions.length) {
      descriptions.splice(index, 1);
      if (descriptions.length === 0) {
        delete this.policyDescriptions[policyId];
      }
    }
  }
}
