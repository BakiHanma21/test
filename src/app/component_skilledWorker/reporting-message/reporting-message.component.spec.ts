import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingMessageComponent } from './reporting-message.component';

describe('ReportingMessageComponent', () => {
  let component: ReportingMessageComponent;
  let fixture: ComponentFixture<ReportingMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportingMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
