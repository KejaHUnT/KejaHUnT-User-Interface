import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PropertyDashboardComponent } from '../property-dashboard/property-dashboard.component';
import { OverviewComponent } from '../overview/overview.component';

@NgModule({
  declarations: [
    PropertyDashboardComponent,
    SidebarComponent,
    OverviewComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PropertyDashboardComponent
  ]
})
export class DashboardModule { }