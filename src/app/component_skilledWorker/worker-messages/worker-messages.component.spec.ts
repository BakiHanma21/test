import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerMessagesComponent } from './worker-messages.component';

describe('WorkerMessagesComponent', () => {
  let component: WorkerMessagesComponent;
  let fixture: ComponentFixture<WorkerMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
