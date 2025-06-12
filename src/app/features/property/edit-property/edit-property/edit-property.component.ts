import { Component, OnDestroy, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';
import { catchError, forkJoin, Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { UpdatePropertyRequest } from '../../models/update-property-request.model';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { ImageService } from 'src/app/features/shared/images/service/image.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { GeneralFeatures } from '../../models/general-feature.model';
import { IndoorFeature } from '../../models/indoor-feature.model';
import { outdoorFeature } from '../../models/outdoor-feature.model';
import { Policy } from '../../models/policy.model';
import { UpdatePolicyDescription } from '../../models/update-policy-description.model';

@Component({
  selector: 'app-edit-property',
  templateUrl: './edit-property.component.html',
  styleUrls: ['./edit-property.component.css']
})
export class EditPropertyComponent implements OnInit, OnDestroy {
  id: string | null = null;
  selectedImageFile: File | null = null;
  model?: Property;
  unitImageFiles: { [index: number]: File } = {};
  message: string = '';
  propertyId: string = '';
  unitImageUrls: string[] = []; // Array to store base64 image data
  propertyImageUrl: string | null = null; // Store the property image base64 data
  features$?: Observable<GeneralFeatures[]>;
  indoor$?: Observable<IndoorFeature[]>;
  outdoor$?: Observable<outdoorFeature[]>;
  policy$?: Observable<Policy[]>;
  //  Maps policyId -> description[]
  policyDescription: { [key: number]: string[] } = {};

  // For new description input fields
  newPolicyDescriptionInputs: { [key: number]: string } = {};

  routeSubscription?: Subscription;
  updatePropertySubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  deletePropertySubscription?: Subscription;

  constructor(private route: ActivatedRoute,
    private unitService: UnitService,
    private propertyService: PropertyService,
    private imageService: ImageService, // Inject ImageService for fetching existing images
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
              this.model = response;

              this.model.generalFeatures = (response.generalFeatures || []).map((f: any) => f.id);
              this.model.indoorFeatures = (response.indoorFeatures || []).map((f: any) => f.id);
              this.model.outDoorFeatures = (response.outDoorFeatures || []).map((f: any) => f.id);
              this.initializePolicyDescriptions();

              if (!this.model.units) {
                this.model.units = [];
              }
              // Fetch the existing property image (if any)
              if (this.model.documentId) {
                this.imageService.getFileByDocumentId(this.model.documentId).subscribe({
                  next: (fileResponse: FileResponse) => {
                    this.propertyImageUrl = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                  },
                  error: (err) => console.error('Failed to fetch property image', err),
                });
              }

              // Fetch the existing unit images (if any)
              this.model.units.forEach((unit, index) => {
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

  // Handle image file selection for property
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.propertyImageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  // Handle unit image file selection
  onUnitFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.unitImageFiles[index] = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.unitImageUrls[index] = reader.result as string;
      };
      reader.readAsDataURL(this.unitImageFiles[index]);
    }
  }

  // Handlers for checkbox changes, updating selected feature arrays
  onGeneralFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.model) {
      if (checked) {
        this.model.generalFeatures = [
          ...(this.model.generalFeatures || []),
          featureId
        ];
      } else {
        this.model.generalFeatures = (
          this.model.generalFeatures || []
        ).filter(id => id !== featureId);
      }
    }
  }

  onIndoorFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.model) {
      if (checked) {
        this.model.indoorFeatures = [
          ...(this.model.indoorFeatures || []),
          featureId
        ];
      } else {
        this.model.indoorFeatures = (
          this.model.indoorFeatures || []
        ).filter(id => id !== featureId);
      }
    }
  }

  onOutdoorFeatureChange(event: Event, featureId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.model) {
      if (checked) {
        this.model.outDoorFeatures = [
          ...(this.model.outDoorFeatures || []),
          featureId
        ];
      } else {
        this.model.outDoorFeatures = (
          this.model.outDoorFeatures || []
        ).filter(id => id !== featureId);
      }
    }
  }

  onSelectPolicy(policy: Policy): void {
    if (!this.policyDescription[policy.id]) {
      this.policyDescription[policy.id] = [];
      this.newPolicyDescriptionInputs[policy.id] = '';
    }
  }

  onAddPolicyDescription(policyId: number): void {
    const desc = this.newPolicyDescriptionInputs[policyId]?.trim();
    if (desc) {
      if (!this.policyDescription[policyId]) {
        this.policyDescription[policyId] = [];
      }
      this.policyDescription[policyId].push(desc);
      this.newPolicyDescriptionInputs[policyId] = '';
    }
  }


  initializePolicyDescriptions() {
    this.policyDescription = {}; // reset just in case

    if (this.model?.policyDescriptions) {
      for (const desc of this.model.policyDescriptions) {
        const policyId = desc.policyId;
        if (!this.policyDescription[policyId]) {
          this.policyDescription[policyId] = [];
        }
        this.policyDescription[policyId].push(desc.name);
      }
    }
  }

  removePolicyDescription(policyId: number, descriptionIndex: number): void {
    const descriptions = this.policyDescription[policyId];
    if (descriptions && descriptionIndex > -1 && descriptionIndex < descriptions.length) {
      descriptions.splice(descriptionIndex, 1);

      // Clean up if no descriptions remain
      if (descriptions.length === 0) {
        delete this.policyDescription[policyId];
      }
    }
  }

  // Submit form to update property and units
  onFormSubmit(): void {
    if (!this.model) return;

    const propertyFormData = new FormData();
    propertyFormData.append('documentId', this.model?.documentId ?? ''); // send GUID string or empty string
    propertyFormData.append('name', this.model.name);
    propertyFormData.append('location', this.model.location);
    propertyFormData.append('type', this.model.type);
    propertyFormData.append('description', this.model.description);
    // Append policy descriptions to the form data
    const policyDescriptions = this.model?.policyDescriptions ?? {};

    // Use the current policyDescription map, which includes new changes, not model.policyDescriptions
    Object.keys(this.policyDescription).forEach(idStr => {
      const policyId = parseInt(idStr, 10);
      const descriptions = this.policyDescription[policyId];

      if (Array.isArray(descriptions)) {
        descriptions.forEach((descriptionName: string) => {
          const policyDescription = {
            id: policyId, // Assuming new descriptions, set ID to 0
            name: descriptionName
          };

          propertyFormData.append('policyDescriptions', JSON.stringify(policyDescription));
        });
      }
    });

    if (this.selectedImageFile) {
      propertyFormData.append('imageFile', this.selectedImageFile, this.selectedImageFile.name);
    }



    // Append each ID individually
    this.model.generalFeatures.forEach((featureId: number) => {
      propertyFormData.append('generalFeatures', featureId.toString());
    });

    this.model.indoorFeatures.forEach((featureId: number) => {
      propertyFormData.append('indoorFeatures', featureId.toString());
    });

    this.model.outDoorFeatures.forEach((featureId: number) => {
      propertyFormData.append('outdoorFeatures', featureId.toString());
    });


    this.updatePropertySubscription = this.propertyService.updateProperty(this.propertyId, propertyFormData).subscribe({
      next: (propertyResponse) => {
        //  If no units exist, skip forkJoin and navigate immediately
        if (!this.model?.units || this.model.units.length === 0) {
          this.message = 'Property updated successfully!';
          this.router.navigateByUrl('admin/property');
          return;
        }

        const unitRequests: Observable<any>[] = [];

        this.model.units.forEach((unit, index) => {
          const unitFormData = new FormData();

          const unitDto = {
            price: unit.price,
            type: unit.type,
            bathrooms: unit.bathrooms,
            size: unit.size,
            floor: unit.floor,
            doorNumber: unit.doorNumber,
            status: unit.status,
            propertyId: this.propertyId,
            documentId: unit.documentId || null
          };

          const unitArray = [unitDto];
          unitFormData.append('Units', JSON.stringify(unitArray));

          const imageFile = this.unitImageFiles[index];
          if (imageFile) {
            unitFormData.append('ImageFile', imageFile, imageFile.name);
          }

          const request$ = (unit.id === 0 || !unit.id)
            ? this.unitService.createUnit(unitFormData)
            : this.unitService.updateUnit(unit.id.toString(), unitFormData);

          unitRequests.push(
            request$.pipe(
              catchError((err) => {
                console.error(`Error processing unit with ID ${unit.id || 'new'}:`, err);
                return of(null);
              })
            )
          );
        });

        forkJoin(unitRequests).subscribe({
          next: (results) => {
            console.log('Units processed:', results);
            this.message = 'Property and units updated successfully!';
            this.router.navigateByUrl('admin/property');
          },
          error: (err) => {
            console.error('Unit processing error:', err);
            this.message = 'Some units may have failed to update.';
          }
        });
      },
      error: (err) => {
        console.error('Failed to update property:', err);
        this.message = 'Failed to update property.';
      }
    });

    console.log('Final model sent:', this.model);
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

    // If the unit has an ID (already saved in the backend), call the service
    if (unit?.id) {
      this.unitService.deleteUnit(unit.id.toString()).subscribe({
        next: () => {
          this.model?.units.splice(index, 1);
          delete this.unitImageFiles[index];
        },
        error: (err) => {
          console.error('Failed to delete unit:', err);
          alert('Failed to delete unit. Please try again.');
        }
      });
    } else {
      // If unit is not yet saved (no ID), just remove from form
      this.model?.units.splice(index, 1);
      delete this.unitImageFiles[index];
    }
  }



  onDelete(): void {
    if (this.id) {
      this.deletePropertySubscription = this.propertyService.deleteProperty(this.id).subscribe({
        next: () => this.router.navigateByUrl('admin/property'),
        error: (err) => console.error('Delete failed', err)
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
