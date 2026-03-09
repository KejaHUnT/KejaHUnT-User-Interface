import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDashboardComponent } from './property-dashboard.component';

describe('PropertyDashboardComponent', () => {
  let component: PropertyDashboardComponent;
  let fixture: ComponentFixture<PropertyDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyDashboardComponent]
    });
    fixture = TestBed.createComponent(PropertyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
