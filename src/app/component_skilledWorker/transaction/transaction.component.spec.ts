import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerTransactionComponent } from './transaction.component';

describe('WorkerTransactionComponent', () => {
  let component: WorkerTransactionComponent;
  let fixture: ComponentFixture<WorkerTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkerTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
