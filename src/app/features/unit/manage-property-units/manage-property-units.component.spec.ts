import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePropertyUnitsComponent } from './manage-property-units.component';

describe('ManagePropertyUnitsComponent', () => {
  let component: ManagePropertyUnitsComponent;
  let fixture: ComponentFixture<ManagePropertyUnitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagePropertyUnitsComponent]
    });
    fixture = TestBed.createComponent(ManagePropertyUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
