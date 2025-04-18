import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleBasedAccessControlComponent } from './role-based-access-control.component';

describe('RoleBasedAccessControlComponent', () => {
  let component: RoleBasedAccessControlComponent;
  let fixture: ComponentFixture<RoleBasedAccessControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleBasedAccessControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleBasedAccessControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
