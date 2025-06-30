import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './core/features/navbar/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AddPropertyComponent } from './features/property/add-property/add-property/add-property.component';
import { PropertyListComponent } from './features/property/property-list/property-list/property-list.component';
import { EditPropertyComponent } from './features/property/edit-property/edit-property/edit-property.component';
import { HomeComponent } from './features/public/home/home/home.component';
import { TenantListComponent } from './features/tenant/tenant-list/tenant-list/tenant-list.component';
import { AddTenantComponent } from './features/tenant/add-tenant/add-tenant/add-tenant.component';
import { PropertyDetailsComponent } from './features/public/property-details/property-details/property-details.component';
import { EditTenentComponent } from './features/tenant/edit-tenant/edit-tenent/edit-tenent.component';
import { SidebarComponent } from './core/features/sidebar/sidebar/sidebar.component';
import { ManagerPortalComponent } from './features/public/manager-portal/manager-portal/manager-portal.component';
import { CreateBookingRequestComponent } from './features/unit/booking-preview/create-booking-request/create-booking-request/create-booking-request.component';
import { BookingSummaryComponent } from './features/unit/booking-preview/booking-summary/booking-summary/booking-summary.component';
import { EditUnitComponent } from './features/unit/edit-unit/edit-unit/edit-unit.component';
import { PaymentListComponent } from './features/unit/payments/payment-list/payment-list/payment-list.component';
import { UnitPaymentListComponent } from './features/unit/payments/unit-payment-list/unit-payment-list/unit-payment-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PageComponent } from './features/tenant/dashboard/components/page/page.component';



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AddPropertyComponent,
    PropertyListComponent,
    EditPropertyComponent,
    HomeComponent,
    TenantListComponent,
    AddTenantComponent,
    PropertyDetailsComponent,
    EditTenentComponent,
    PropertyDetailsComponent,
    SidebarComponent,
    ManagerPortalComponent,
    CreateBookingRequestComponent,
    BookingSummaryComponent,
    EditUnitComponent,
    PaymentListComponent,
    UnitPaymentListComponent,
    PageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
