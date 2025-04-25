import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTenentComponent } from './edit-tenent.component';

describe('EditTenentComponent', () => {
  let component: EditTenentComponent;
  let fixture: ComponentFixture<EditTenentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditTenentComponent]
    });
    fixture = TestBed.createComponent(EditTenentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
