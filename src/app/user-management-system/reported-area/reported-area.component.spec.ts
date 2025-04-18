import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportedAreaComponent } from './reported-area.component';

describe('ReportedAreaComponent', () => {
  let component: ReportedAreaComponent;
  let fixture: ComponentFixture<ReportedAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportedAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
