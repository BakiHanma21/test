import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkilledRegistrationComponent } from './skilled-registration.component';

describe('SkilledRegistrationComponent', () => {
  let component: SkilledRegistrationComponent;
  let fixture: ComponentFixture<SkilledRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkilledRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkilledRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
