import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkilledWorkerPageComponent } from './skilled-worker-page.component';

describe('SkilledWorkerPageComponent', () => {
  let component: SkilledWorkerPageComponent;
  let fixture: ComponentFixture<SkilledWorkerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkilledWorkerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkilledWorkerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
