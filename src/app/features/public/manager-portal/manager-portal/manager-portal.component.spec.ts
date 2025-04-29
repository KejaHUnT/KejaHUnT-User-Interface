import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerPortalComponent } from './manager-portal.component';

describe('ManagerPortalComponent', () => {
  let component: ManagerPortalComponent;
  let fixture: ComponentFixture<ManagerPortalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerPortalComponent]
    });
    fixture = TestBed.createComponent(ManagerPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
