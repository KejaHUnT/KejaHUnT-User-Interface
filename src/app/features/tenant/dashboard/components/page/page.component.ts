import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Unit } from 'src/app/features/property/models/unit.model';
import { Property } from 'src/app/features/property/models/property.model';
import { Tenant } from '../../../models/tenant.model';

import { TenantService } from '../../../services/tenant.service';
import { UnitService } from 'src/app/features/unit/services/unit.service';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnDestroy {
  tenantId!: string;
  unitId!: string;

  tenant?: Tenant;
  unitDetails?: Unit;
  propertyDetails?: Property;

  greetingMessage = '';
  showPropertyDetails = false;

  showPaymentModal = false; // <-- modal state

  routeSubscription?: Subscription;
  tenantSubscription?: Subscription;
  unitSubscription?: Subscription;
  propertySubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private tenantService: TenantService,
    private unitService: UnitService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.greetingMessage = this.getGreetingMessage();

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      this.tenantId = id;
      this.loadTenantAndUnit(id);
    });
  }

  /** ---------------- Load Tenant + Unit + Property ---------------- */
  private loadTenantAndUnit(tenantId: string): void {
    this.tenantSubscription = this.tenantService.getTenantById(tenantId).subscribe({
      next: tenant => {
        this.tenant = tenant;
        if (!tenant.unitId) return;

        this.unitId = tenant.unitId.toString();
        this.fetchUnitDetails(this.unitId);
      },
      error: err => console.error('Error loading tenant', err)
    });
  }

  private fetchUnitDetails(unitId: string): void {
    this.unitSubscription = this.unitService.getUnitById(unitId).subscribe({
      next: unit => {
        this.unitDetails = unit;

        if (unit.propertyId) {
          this.propertySubscription = this.propertyService.getPopertyById(unit.propertyId.toString())
            .subscribe(prop => this.propertyDetails = prop);
        }
      },
      error: err => console.error('Error loading unit', err)
    });
  }

  /** ---------------- UI Helpers ---------------- */
  togglePropertyDetails(): void {
    this.showPropertyDetails = !this.showPropertyDetails;
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 18) return 'Good afternoon 🌤️';
    return 'Good evening 🌙';
  }

  /** ---------------- Payment Modal ---------------- */
  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  /** ---------------- Cleanup ---------------- */
  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.tenantSubscription?.unsubscribe();
    this.unitSubscription?.unsubscribe();
    this.propertySubscription?.unsubscribe();
  }
}
