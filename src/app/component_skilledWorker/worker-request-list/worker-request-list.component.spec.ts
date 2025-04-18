import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerRequestListComponent1 } from './worker-request-list.component';

describe('WorkerRequestListComponent', () => {
  let component: WorkerRequestListComponent1;
  let fixture: ComponentFixture<WorkerRequestListComponent1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerRequestListComponent1]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkerRequestListComponent1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
