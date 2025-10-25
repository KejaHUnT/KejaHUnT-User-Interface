import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { Policy } from 'src/app/features/property/models/policy.model';
import { Property } from 'src/app/features/property/models/property.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { ImageService } from 'src/app/features/shared/images/service/image.service';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css']
})
export class PropertyDetailsComponent implements OnInit, OnDestroy {
  id: string | null = null;
  model?: Property;
  imageUrl: string = '';
  unitImageUrls: { [index: number]: string } = {};

  groupedPolicies: any[] = [];

  routeSubscription?: Subscription;
  getPropertyByIdSubscription?: Subscription;
  getFileByDocumentIdSubscription?: Subscription;
  getPoliciesSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private imageService: ImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');

        if (this.id) {
          this.getPropertyByIdSubscription = this.propertyService.getPopertyById(this.id).subscribe({
            next: (response) => {
              this.model = response;
              if (!this.model.units) this.model.units = [];

              // Fetch property image
              if (this.model.documentId) {
                this.getFileByDocumentIdSubscription = this.imageService.getFileByDocumentId(this.model.documentId).subscribe({
                  next: (fileResponse: FileResponse) => {
                    this.imageUrl = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                  },
                  error: (err) => console.error('Error fetching property image', err)
                });
              }

              // Fetch each unit image
              this.model.units.forEach((unit, index) => {
                if (unit.documentId) {
                  this.imageService.getFileByDocumentId(unit.documentId).subscribe({
                    next: (fileResponse: FileResponse) => {
                      this.unitImageUrls[index] = `data:image/${fileResponse.extension.replace('.', '')};base64,${fileResponse.base64}`;
                    },
                    error: (err) => console.error(`Error fetching image for unit ${index}`, err)
                  });
                }
              });

              // 📝 Fetch all policies and group by those referenced in property
              if (this.model.policyDescriptions?.length) {
                const policyIds = this.model.policyDescriptions.map(d => d.policyId);

                this.getPoliciesSubscription = this.propertyService.getAllPolicies().subscribe({
                  next: (allPolicies: Policy[]) => {
                    // Filter only policies that have desc in this property
                    const relevantPolicies = allPolicies.filter(p => policyIds.includes(p.id));

                    // Group descriptions under their respective policies
                    const grouped = relevantPolicies.map(policy => {
                      return {
                        id: policy.id,
                        name: policy.name,
                        descriptions: this.model!.policyDescriptions.filter(d => d.policyId === policy.id)
                      };
                    });

                    this.groupedPolicies = grouped;
                  },
                  error: (err) => console.error('Error fetching policies', err)
                });
              }

            },
            error: (err) => console.error('Error fetching property details', err)
          });
        }
      }
    });
  }

  onBookNow(unit: any): void {
    if (this.model) {
      this.router.navigate([`/preview-booking/${unit.id}`], {
        queryParams: {
          propertyId: this.model.id,
          unitId: unit.id,
          unitName: unit.name,
          unitSize: unit.size,
          unitRent: unit.price,
          unitStatus: unit.status,
          unitDescription: unit.description
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.getPropertyByIdSubscription?.unsubscribe();
    this.getFileByDocumentIdSubscription?.unsubscribe();
    this.getPoliciesSubscription?.unsubscribe();
  }
}
