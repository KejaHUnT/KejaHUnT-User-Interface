import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './features/property/property-list/property-list/property-list.component';
import { AddPropertyComponent } from './features/property/add-property/add-property/add-property.component';
import { EditPropertyComponent } from './features/property/edit-property/edit-property/edit-property.component';
import { HomeComponent } from './features/public/home/home/home.component';
import { TenantListComponent } from './features/tenant/tenant-list/tenant-list/tenant-list.component';
import { AddTenantComponent } from './features/tenant/add-tenant/add-tenant/add-tenant.component';
import { PropertyDetailsComponent } from './features/public/property-details/property-details/property-details.component';
import { EditTenentComponent } from './features/tenant/edit-tenant/edit-tenent/edit-tenent.component';
import { ManagerPortalComponent } from './features/public/manager-portal/manager-portal/manager-portal.component';
import { CreateBookingRequestComponent } from './features/unit/booking-preview/create-booking-request/create-booking-request/create-booking-request.component';
import { BookingSummaryComponent } from './features/unit/booking-preview/booking-summary/booking-summary/booking-summary.component';
import { EditUnitComponent } from './features/unit/edit-unit/edit-unit/edit-unit.component';
import { PaymentListComponent } from './features/unit/payments/payment-list/payment-list/payment-list.component';
import { UnitPaymentListComponent } from './features/unit/payments/unit-payment-list/unit-payment-list/unit-payment-list.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'admin/property',
    component: PropertyListComponent
  },
  {
    path: 'admin/property/add',
    component: AddPropertyComponent
  },
  {
    path: 'admin/property/:id',
    component: EditPropertyComponent
  },
  {
    path: 'admin/tenant',
    component: TenantListComponent
  },
  {
    path: 'admin/tenant/add',
    component: AddTenantComponent
  },
  {
    path: 'property/details/:id',
    component: PropertyDetailsComponent
  },
  {
    path: 'admin/tenant/:id',
    component: EditTenentComponent
  },
  {
    path: 'unit/:id',
    component: EditUnitComponent
  },
  {
    path: 'portal/manage',
    component: ManagerPortalComponent
  },
  {
    path: 'preview-booking/:unitId',
    component: CreateBookingRequestComponent
  },
  {
    path: 'booking/summary',
    component: BookingSummaryComponent
  },
  {
    path: 'payment/:id',
    component: PaymentListComponent
  },
  {
    path: 'unit/payment/:id',
    component: UnitPaymentListComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
