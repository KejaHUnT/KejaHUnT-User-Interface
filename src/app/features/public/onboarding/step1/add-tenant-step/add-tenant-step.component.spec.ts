import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTenantStepComponent } from './add-tenant-step.component';

describe('AddTenantStepComponent', () => {
  let component: AddTenantStepComponent;
  let fixture: ComponentFixture<AddTenantStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTenantStepComponent]
    });
    fixture = TestBed.createComponent(AddTenantStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
