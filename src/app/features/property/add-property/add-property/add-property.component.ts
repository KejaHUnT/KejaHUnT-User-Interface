import { Component, OnInit } from '@angular/core';
import { AddPropertyRequest } from '../../models/add-property-request.model';
import { PropertyService } from '../../services/property.service';
import { Router } from '@angular/router';
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
  model: AddPropertyRequest;
  message: string = '';

  isSubmitting: boolean = false;

  features$?: Observable<GeneralFeatures[]>;
  indoor$?: Observable<IndoorFeature[]>;
  outdoor$?: Observable<outdoorFeature[]>;
  policy$?: Observable<Policy[]>;
  policyDescriptions: { [policyId: number]: string[] } = {};
  newPolicyDescriptionInputs: { [policyId: number]: string } = {};

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private authService: AuthService
  ) {
    this.model = {
      name: '',
      type: '',
      location: '',
      description: '',
      email: this.authService.getLoggedInUserEmail() ?? '',
      generalFeatures: [],
      outdoorFeatures: [],
      indoorFeatures: [],
      units: []
    };
  }

  ngOnInit(): void {
    this.features$ = this.propertyService.getAllFeatures();
    this.indoor$   = this.propertyService.getAllIndoorFeatures();
    this.outdoor$  = this.propertyService.getAllOutdorrFeatures();
    this.policy$   = this.propertyService.getAllPolicies();
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

  onFormSubmit(): void {

    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const propertyFormData = new FormData();
    propertyFormData.append('name',        this.model.name);
    propertyFormData.append('location',    this.model.location);
    propertyFormData.append('type',        this.model.type);
    propertyFormData.append('description', this.model.description);
    propertyFormData.append('email',       this.model.email);

    this.model.generalFeatures.forEach(id => propertyFormData.append('generalFeatures', id.toString()));
    this.model.indoorFeatures.forEach(id  => propertyFormData.append('indoorFeatures',  id.toString()));
    this.model.outdoorFeatures.forEach(id => propertyFormData.append('outdoorFeatures', id.toString()));

    if (this.selectedImageFile) {
      propertyFormData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }

    this.propertyService.createProperty(propertyFormData).subscribe({
      next: (propertyResponse) => {
        const propertyId = propertyResponse.id;

        this.createPolicyDescriptions(propertyId)
          .then(() => {
            this.message = 'Property created successfully!';
            this.isSubmitting = false; 
            this.router.navigateByUrl(`portal/manage`);
          })
          .catch(() => {
            this.message = 'Property created, but some policy descriptions failed.';
            this.isSubmitting = false; 
            this.router.navigateByUrl(`portal/manage`);
          });
      },
      error: () => {
        this.message = 'Failed to create property. Please try again.';
        this.isSubmitting = false; 
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
          pendingPropertyId
        };
        policyPromises.push(
          this.propertyService.addPolicyDescription(policyDescription).toPromise()
        );
      });
    });

    return Promise.all(policyPromises).then(() => {});
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
    if (this.policyDescriptions[policy.id] !== undefined) {
      delete this.policyDescriptions[policy.id];
      delete this.newPolicyDescriptionInputs[policy.id];
    } else {
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
        delete this.newPolicyDescriptionInputs[policyId];
      }
    }
  }
}