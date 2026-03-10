import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRedirectComponent } from './dashboard-redirect.component';

describe('DashboardRedirectComponent', () => {
  let component: DashboardRedirectComponent;
  let fixture: ComponentFixture<DashboardRedirectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardRedirectComponent]
    });
    fixture = TestBed.createComponent(DashboardRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
