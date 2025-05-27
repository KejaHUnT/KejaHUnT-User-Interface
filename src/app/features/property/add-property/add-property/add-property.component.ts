import { Component, OnInit, ViewChild } from '@angular/core';
import { AddPropertyRequest } from '../../models/add-property-request.model';
import { PropertyService } from '../../services/property.service';
import { Router } from '@angular/router';
import { CreateUnitRequest } from '../../models/create-unit-request.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { Observable } from 'rxjs';
import { GeneralFeatures } from '../../models/general-feature.model';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IndoorFeature } from '../../models/indoor-feature.model';
import { outdoorFeature } from '../../models/outdoor-feature.model';
import { Policy } from '../../models/policy.model';
import { AddPolicyDescription } from '../../models/add-policy-description.model';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent implements OnInit {
  selectedImageFile: File | null = null;
  propertyImagePreview: string | null = null;
  latestPropertyId: number | null = null;
  unitImageUrls: string[] = []; // Array to store base64 image data
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
    private router: Router
  ) {
    this.model = {
      name: '',
      type: '',
      location: '',
      description: '',
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

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        this.propertyImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  onUnitFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Store the file in the preview map
      this.unitImageFiles[index] = file;

      // Also bind the file directly to the model
      this.model.units[index].imageFile = file;

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.unitImageUrls[index] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  // Add an empty unit to the form
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

    // Basic property info
    propertyFormData.append('name', this.model.name);
    propertyFormData.append('location', this.model.location);
    propertyFormData.append('type', this.model.type);
    propertyFormData.append('description', this.model.description);

    // General features
    this.model.generalFeatures.forEach((featureId: number) => {
      propertyFormData.append('generalFeatures', featureId.toString());
    });

    this.model.indoorFeatures.forEach((featureId: number) => {
      propertyFormData.append('indoorFeatures', featureId.toString());
    });

    this.model.outdoorFeatures.forEach((featureId: number) => {
      propertyFormData.append('outdoorFeatures', featureId.toString());
    });

    // Image (optional)
    if (this.selectedImageFile) {
      propertyFormData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }

    // Step 1: Create property
    this.propertyService.createProperty(propertyFormData).subscribe({
      next: (propertyResponse) => {
        const propertyId = propertyResponse.id;
        this.latestPropertyId = propertyResponse.id;

        // Save policy descriptions after property is created
        Object.keys(this.policyDescriptions).forEach(policyIdStr => {
          const policyId = parseInt(policyIdStr);
          const descriptions = this.policyDescriptions[policyId];

          descriptions.forEach(name => {
            const policyDescription: AddPolicyDescription = {
              name,
              policyId,
              propertyId: propertyId
            };

            this.propertyService.addPolicyDescription(policyDescription).subscribe({
              next: () => console.log('✅ Policy description added:', policyDescription),
              error: (err) => console.error('❌ Failed to add policy description:', err)
            });
          });
        });


        // Check if units exist
        const hasUnits = Array.isArray(this.model.units) && this.model.units.length > 0;

        if (hasUnits) {
          // Prepare units
          const unitsForUpload = this.model.units.map(unit => ({
            price: unit.price,
            type: unit.type,
            bathrooms: unit.bathrooms,
            size: unit.size,
            floor: unit.floor,
            doorNumber: unit.doorNumber,
            status: unit.status,
            propertyId: propertyId
          }));

          const unitFormData = new FormData();
          unitFormData.append('units', JSON.stringify(unitsForUpload));

          this.model.units.forEach(unit => {
            if (unit.imageFile) {
              unitFormData.append('imageFile', unit.imageFile, unit.imageFile.name);
            }
          });

          // Step 2: Create units
          this.unitService.createUnit(unitFormData).subscribe({
            next: (response) => {
              console.log('✅ Units created:', response);
              this.message = 'Property and units created successfully!';
              this.router.navigateByUrl('admin/property');
            },
            error: (err) => {
              console.error('❌ Unit creation failed:', err);
              this.message = 'Property created, but failed to add units.';
              this.router.navigateByUrl('admin/property'); // Redirect anyway
            }
          });
        } else {
          // No units to create, redirect directly
          this.message = 'Property created successfully!';
          this.router.navigateByUrl('admin/property');
        }
      },
      error: (err) => {
        console.error('❌ Property creation failed:', err);
        this.message = 'Failed to create property.';
      }
    });

    console.log('📦 Final model sent:', this.model);
  }

  onGeneralFeatureChange(event: Event, featureId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    const features = this.model.generalFeatures || [];

    if (checked) {
      this.model.generalFeatures = [...features, featureId];
    } else {
      this.model.generalFeatures = features.filter(id => id !== featureId);
    }
  }

  onIndoorFeatureChange(event: Event, indoorid: number) {
    const checked = (event.target as HTMLInputElement).checked;
    const indoor = this.model.indoorFeatures || [];

    if (checked) {
      this.model.indoorFeatures = [...indoor, indoorid];
    } else {
      this.model.indoorFeatures = indoor.filter(id => id !== indoorid);
    }
  }

  onOutdoorFeatureChange(event: Event, outdoorId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    const outdoor = this.model.outdoorFeatures || [];

    if (checked) {
      this.model.outdoorFeatures = [...outdoor, outdoorId];
    } else {
      this.model.outdoorFeatures = outdoor.filter(id => id !== outdoorId);
    }
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

  removePolicyDescription(policyId: number, descriptionIndex: number): void {
    const descriptions = this.policyDescriptions[policyId];
    if (descriptions && descriptionIndex > -1 && descriptionIndex < descriptions.length) {
      descriptions.splice(descriptionIndex, 1);

      // Clean up if no descriptions remain
      if (descriptions.length === 0) {
        delete this.policyDescriptions[policyId];
      }
    }
  }


}
