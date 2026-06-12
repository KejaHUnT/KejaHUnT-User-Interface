import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Policy } from 'src/app/features/property/models/policy.model';
import { Property } from 'src/app/features/property/models/property.model';
import { UpdatePolicyDescription } from 'src/app/features/property/models/update-policy-description.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { FileResponse } from 'src/app/features/shared/images/models/file-response.model';
import { ImageService } from 'src/app/features/shared/images/service/image.service';

interface GroupedPolicy {
  id: number;
  name: string;
  descriptions: UpdatePolicyDescription[];
}

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.css'],
})
export class PropertyDetailsComponent implements OnInit, OnDestroy {
  id: string | null = null;
  model?: Property;
  imageUrl = '';
  unitImageUrls: Record<number, string> = {};
  groupedPolicies: GroupedPolicy[] = [];

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private imageService: ImageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');
        if (this.id) {
          this.loadProperty(this.id);
        }
      },
    });

    this.subscriptions.add(routeSub);
  }

  trackById(_index: number, item: { id?: string | number }): string | number {
    return item.id ?? _index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onBookNow(unit: any): void {
    if (!this.model) return;

    this.router.navigate([`/preview-booking/${unit.id}`], {
      queryParams: {
        propertyId: this.model.id,
        unitId: unit.id,
        unitName: unit.name,
        unitSize: unit.size,
        unitRent: unit.price,
        unitStatus: unit.status,
        unitDescription: unit.description,
      },
    });
  }

  private loadProperty(id: string): void {
    const propertySub = this.propertyService.getPopertyById(id).subscribe({
      next: (response) => {
        this.model = response;
        if (!this.model.units) this.model.units = [];

        this.loadPropertyImage(this.model.documentId);
        this.loadUnitImages(this.model.units);
        this.loadPolicies(this.model.policyDescriptions);
      },
      error: (err) => console.error('Error fetching property details', err),
    });

    this.subscriptions.add(propertySub);
  }

  private loadPropertyImage(documentId?: string): void {
    if (!documentId) return;

    const sub = this.imageService.getFileByDocumentId(documentId).subscribe({
      next: (fileResponse: FileResponse) => {
        this.imageUrl = this.toDataUrl(fileResponse);
      },
      error: (err) => console.error('Error fetching property image', err),
    });

    this.subscriptions.add(sub);
  }

  private loadUnitImages(units: any[]): void {
    units.forEach((unit, index) => {
      if (!unit.documentId) return;

      const sub = this.imageService
        .getFileByDocumentId(unit.documentId)
        .subscribe({
          next: (fileResponse: FileResponse) => {
            this.unitImageUrls[index] = this.toDataUrl(fileResponse);
          },
          error: (err) =>
            console.error(`Error fetching image for unit ${index}`, err),
        });

      this.subscriptions.add(sub);
    });
  }

  private loadPolicies(policyDescriptions?: UpdatePolicyDescription[]): void {
    if (!policyDescriptions?.length) return;

    const policyIds = new Set(policyDescriptions.map((d) => d.policyId));

    const sub = this.propertyService.getAllPolicies().subscribe({
      next: (allPolicies: Policy[]) => {
        this.groupedPolicies = allPolicies
          .filter((p) => policyIds.has(p.id))
          .map((policy) => ({
            id: policy.id,
            name: policy.name,
            descriptions: policyDescriptions.filter(
              (d) => d.policyId === policy.id,
            ),
          }));
      },
      error: (err) => console.error('Error fetching policies', err),
    });

    this.subscriptions.add(sub);
  }

  private toDataUrl(fileResponse: FileResponse): string {
    const extension = fileResponse.extension.replace('.', '');
    return `data:image/${extension};base64,${fileResponse.base64}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
