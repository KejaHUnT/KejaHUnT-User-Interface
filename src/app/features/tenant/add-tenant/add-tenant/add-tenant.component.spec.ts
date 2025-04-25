import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTenantComponent } from './add-tenant.component';

describe('AddTenantComponent', () => {
  let component: AddTenantComponent;
  let fixture: ComponentFixture<AddTenantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTenantComponent]
    });
    fixture = TestBed.createComponent(AddTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
