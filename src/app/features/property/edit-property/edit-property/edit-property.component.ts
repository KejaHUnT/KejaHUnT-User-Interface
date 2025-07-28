// ... All imports remain the same ...
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';
import { catchError, forkJoin, Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { GeneralFeatures } from '../../models/general-feature.model';
import { IndoorFeature } from '../../models/indoor-feature.model';
import { outdoorFeature } from '../../models/outdoor-feature.model';
import { Policy } from '../../models/policy.model';
import { AddPolicyDescription } from '../../models/add-policy-description.model';
import { UpdatePropertyRequest } from '../../models/update-property-request.model';

@Component({
  selector: 'app-edit-property',
  templateUrl: './edit-property.component.html',
  styleUrls: ['./edit-property.component.css']
})
export class EditPropertyComponent implements OnInit, OnDestroy {
  id: string | null = null;
  selectedImageFile: File | null = null;
  model?: UpdatePropertyRequest;
  model1?: Property;
  unitImageFiles: { [index: number]: File } = {};
  message: string = '';
  propertyId: string = '';
  unitImageUrls: string[] = [];
  propertyImageUrl: string | null = null;

  features$?: Observable<GeneralFeatures[]>;
  indoor$?: Observable<IndoorFeature[]>;
  outdoor$?: Observable<outdoorFeature[]>;
  policy$?: Observable<Policy[]>;

  policyDescriptions: { [policyId: number]: string[] } = {};
  newPolicyDescriptionInputs: { [policyId: number]: string } = {};

  routeSubscription?: Subscription;
  updatePropertySubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  deletePropertySubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private unitService: UnitService,
    private propertyService: PropertyService,
    private imageService: ImageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.features$ = this.propertyService.getAllFeatures();
    this.indoor$ = this.propertyService.getAllIndoorFeatures();
    this.outdoor$ = this.propertyService.getAllOutdorrFeatures();
    this.policy$ = this.propertyService.getAllPolicies();

    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');
        if (this.id) {
          this.propertyId = this.id;
          this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.id).subscribe({
            next: (response) => {
              this.model1 = response;

              // Initialize the model for updates
              this.model = {
                id: response.id,
                documentId: response.documentId,
                name: response.name,
                location: response.location,
                type: response.type,
                description: response.description,
                generalFeatures: (response.generalFeatures || []).map((f: any) => f.id),
                indoorFeatures: (response.indoorFeatures || []).map((f: any) => f.id),
                outDoorFeatures: (response.outDoorFeatures || []).map((f: any) => f.id),
                policyDescriptions: response.policyDescriptions || [],
                units: response.units || []
              };

              // Also update model1 arrays for backward compatibility
              this.model1.generalFeatures = (response.generalFeatures || []).map((f: any) => f.id);
              this.model1.indoorFeatures = (response.indoorFeatures || []).map((f: any) => f.id);
              this.model1.outDoorFeatures = (response.outDoorFeatures || []).map((f: any) => f.id);
              
              // Initialize policy descriptions with the model data
              this.initializePolicyDescriptions();

              if (!this.model1.units) this.model1.units = [];

              if (this.model1.documentId) {
                this.imageService.getFileByDocumentId(this.model1.documentId).subscribe({
                  next: (fileResponse: FileResponse) => {
                    this.propertyImageUrl = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                  },
                  error: (err) => console.error('Failed to fetch property image', err),
                });
              }

              this.model1.units.forEach((unit, index) => {
                if (unit.documentId) {
                  this.imageService.getFileByDocumentId(unit.documentId).subscribe({
                    next: (fileResponse: FileResponse) => {
                      this.unitImageUrls[index] = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                    },
                    error: (err) => console.error(`Failed to fetch unit ${index} image`, err),
                  });
                }
              });
            },
            error: (err) => console.error('Failed to fetch property', err)
          });
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.propertyImageUrl = reader.result as string;
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  onUnitFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.unitImageFiles[index] = file;
      const reader = new FileReader();
      reader.onload = () => this.unitImageUrls[index] = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onGeneralFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.model) {
      this.model.generalFeatures = checked
        ? [...(this.model.generalFeatures || []), featureId]
        : (this.model.generalFeatures || []).filter(id => id !== featureId);
    }
  }

  onIndoorFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.model) {
      this.model.indoorFeatures = checked
        ? [...(this.model.indoorFeatures || []), featureId]
        : (this.model.indoorFeatures || []).filter(id => id !== featureId);
    }
  }

  onOutdoorFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.model) {
      this.model.outDoorFeatures = checked
        ? [...(this.model.outDoorFeatures || []), featureId]
        : (this.model.outDoorFeatures || []).filter(id => id !== featureId);
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
      if (descriptions.length === 0) {
        delete this.policyDescriptions[policyId];
      }
    }
  }

  initializePolicyDescriptions(): void {
    this.policyDescriptions = {};
    // Use model instead of model1 for policy descriptions
    if (this.model?.policyDescriptions) {
      this.model.policyDescriptions.forEach(desc => {
        if (!this.policyDescriptions[desc.policyId]) {
          this.policyDescriptions[desc.policyId] = [];
        }
        this.policyDescriptions[desc.policyId].push(desc.name);
      });
    }
  }

  onFormSubmit(): void {
    if (!this.model) return;

    this.model.policyDescriptions = [];

    Object.entries(this.policyDescriptions).forEach(([policyIdStr, descriptions]) => {
      const policyId = parseInt(policyIdStr);
      descriptions.forEach(name => {
        this.model?.policyDescriptions.push({
          name,
          policyId,
          propertyId: parseInt(this.propertyId)
        });
      });
    });

    console.log(' Final Property Model Before Submit:', this.model);

    const formData = new FormData();
    formData.append('id', this.model.id.toString());
    formData.append('documentId', this.model.documentId ?? '');
    formData.append('name', this.model.name);
    formData.append('location', this.model.location);
    formData.append('type', this.model.type);
    formData.append('description', this.model.description);

    (this.model.generalFeatures || []).forEach(id =>
      formData.append('generalFeatures', id.toString())
    );
    (this.model.indoorFeatures || []).forEach(id =>
      formData.append('indoorFeatures', id.toString())
    );
    (this.model.outDoorFeatures || []).forEach(id =>
      formData.append('outdoorFeatures', id.toString())
    );

    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }

    formData.append('policyDescriptions', JSON.stringify(this.model.policyDescriptions));
    formData.append('units', JSON.stringify(this.model.units));

    this.updatePropertySubscription = this.propertyService.updateProperty(this.propertyId, formData).subscribe({
      next: () => {
        this.message = 'Property updated successfully!';
        this.router.navigateByUrl('admin/property');
      },
      error: err => {
        console.error(' Property update failed:', err);
        this.message = 'Failed to update property.';
      }
    });
  }

  addUnit(): void {
    if (this.model) {
      this.model.units.push({
        id: 0,
        price: 0,
        type: '',
        bathrooms: 0,
        size: 0,
        floor: 1,
        doorNumber: '',
        status: 'Available',
        propertyId: this.model.id || 0,
        documentId: null
      });
    }
  }

  removeUnit(index: number): void {
    const unit = this.model?.units[index];
    if (unit?.id) {
      this.unitService.deleteUnit(unit.id.toString()).subscribe({
        next: () => {
          this.model?.units.splice(index, 1);
          delete this.unitImageFiles[index];
        },
        error: err => {
          console.error(' Failed to delete unit:', err);
          alert('Failed to delete unit. Please try again.');
        }
      });
    } else {
      this.model?.units.splice(index, 1);
      delete this.unitImageFiles[index];
    }
  }

  onDelete(): void {
    if (this.id) {
      this.deletePropertySubscription = this.propertyService.deleteProperty(this.id).subscribe({
        next: () => this.router.navigateByUrl('admin/property'),
        error: err => console.error(' Delete failed:', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updatePropertySubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
    this.deletePropertySubscription?.unsubscribe();
  }
}