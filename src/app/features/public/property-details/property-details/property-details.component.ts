import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Policy } from 'src/app/features/property/models/policy.model';
import { Property } from 'src/app/features/property/models/property.model';
import { UpdatePolicyDescription } from 'src/app/features/property/models/update-policy-description.model';
import { PropertyService } from 'src/app/features/property/services/property.service';
import { Title, Meta } from '@angular/platform-browser';

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
  groupedPolicies: GroupedPolicy[] = [];

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private router: Router,
    private title: Title,
    private meta: Meta
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
        // Hide occupied units from public view
        this.model.units = this.model.units.filter(u => u.status !== 'Occupied');
        this.loadPolicies(this.model.policyDescriptions);
        this.title.setTitle(`${this.model.name} in ${this.model.location} | KejaHUnT`);
        this.meta.updateTag({ name: 'description', content: `${this.model.name} located in ${this.model.location}, Kenya. Find available units and book your rental home on KejaHunt.` });
        this.meta.updateTag({ property: 'og:title', content: `${this.model.name} | KejaHUnT` });
        this.meta.updateTag({ property: 'og:url', content: `https://kejahunt.co.ke/property/details/${id}` });
      },
      error: (err) => console.error('Error fetching property details', err),
    });

    this.subscriptions.add(propertySub);
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}