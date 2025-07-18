import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBookingStepComponent } from './create-booking-step.component';

describe('CreateBookingStepComponent', () => {
  let component: CreateBookingStepComponent;
  let fixture: ComponentFixture<CreateBookingStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateBookingStepComponent]
    });
    fixture = TestBed.createComponent(CreateBookingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
