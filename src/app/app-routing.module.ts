import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './features/property/property-list/property-list/property-list.component';
import { AddPropertyComponent } from './features/property/add-property/add-property/add-property.component';
import { EditPropertyComponent } from './features/property/edit-property/edit-property/edit-property.component';
import { HomeComponent } from './features/public/home/home/home.component';
import { TenantListComponent } from './features/tenant/tenant-list/tenant-list/tenant-list.component';
import { AddTenantComponent } from './features/tenant/add-tenant/add-tenant/add-tenant.component';
import { PropertyDetailsComponent } from './features/public/property-details/property-details/property-details.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
