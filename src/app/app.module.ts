import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './core/features/navbar/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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
import { BookingSummaryComponent } from './features/unit/booking-preview/booking-summary/booking-summary/booking-summary.component';
import { EditUnitComponent } from './features/unit/edit-unit/edit-unit/edit-unit.component';
import { PaymentListComponent } from './features/unit/payments/payment-list/payment-list/payment-list.component';
import { UnitPaymentListComponent } from './features/unit/payments/unit-payment-list/unit-payment-list/unit-payment-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PageComponent } from './features/tenant/dashboard/components/page/page.component';
import { LoginComponent } from './features/auth/login/login/login.component';
import { AuthInterceptor } from './core/Interceptor/auth.interceptor';
import { StepperComponent } from './features/public/onboarding/stepper/stepper/stepper.component';
import { AddTenantStepComponent } from './features/public/onboarding/step1/add-tenant-step/add-tenant-step.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateBookingStepComponent } from './features/public/onboarding/step2/create-booking-step/create-booking-step/create-booking-step.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { PaymentStepComponent } from './features/public/onboarding/step3/create-payment-step/create-payment-step/create-payment-step.component';
import { FooterComponent } from './core/features/footer/footer/footer.component';



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
    BookingSummaryComponent,
    EditUnitComponent,
    PaymentListComponent,
    UnitPaymentListComponent,
    PageComponent,
    LoginComponent,
    StepperComponent,
    AddTenantStepComponent,
    CreateBookingStepComponent,
    PaymentStepComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
