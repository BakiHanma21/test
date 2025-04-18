import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Request } from './request.model';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private requests: Request[] = [
    { id: 1, user: 'John Doe', task: 'Fix plumbing', date: '2024-12-05' },
    { id: 2, user: 'Jane Smith', task: 'Electrical wiring', date: '2024-12-06' },
  ];

  getUnseenRequests(): Observable<Request[]> {
    return of(this.requests);
  }

  markRequestAsSeen(id: number): Observable<void> {
    this.requests = this.requests.filter((req) => req.id !== id);
    return of();
  }

  markRequestsAsSeen(): Observable<void> {
    this.requests = [];
    return of();
  }
}
