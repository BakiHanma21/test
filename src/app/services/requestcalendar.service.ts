import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class RequestCalendarService {
  private eventsSubject = new BehaviorSubject<any[]>([]); 
  events$ = this.eventsSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {}

  getEvents(): void {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
  
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<any>(`http://localhost:8000/api/events`, { headers }).pipe(
        tap((response) => {
          console.log('Fetched events:', response);
          if (Array.isArray(response.data)) {
            const formattedEvents = response.data.map((event: any) => {
              console.log(event);
              const eventStart = event.start;

              const startDate = new Date(`${event.start}T${event.start_time}`);
              const endDate = new Date(`${event.end}T${event.start_time}`);

  
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error('Invalid Date:', event.start);
              }
  
              return {
                title: event.title,
                description: event.description,
                start: startDate,
                end: endDate,
                status: event.status,
                extendedProps: {
                  status: event.status,
                  requestId: event.booking_id
                }
              };
            });
  
            this.eventsSubject.next(formattedEvents);
          } else {
            console.error('Received data is not in the expected format:', response);
          }
        })
      ).subscribe(
        () => {},
        (error) => {
          if (error.status === 401) {
            alert('Unauthorized! Please log in again.');
            this.router.navigate(['/login']);
          } else {
            console.error('Error fetching events:', error);
          }
        }
      );
    } else {
      console.error('Authorization token is missing!');
      this.router.navigate(['/login']);
    }
  }
  
  

  approveRequest(request: any): Observable<any> {
    const authToken = localStorage.getItem('authToken'); 
    const apiUrl = `http://localhost:8000/api/requests/${request.id}`;
    const updatedRequest = { status: 'CONFIRMED' };
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      return this.http.put(apiUrl, updatedRequest, { headers }).pipe(
        tap(() => {
          console.log('time: ' + request.date);
          const event = {
            title: request.title,
            start: new Date(request.date + 'T09:00:00'),
            end: new Date(request.end_date + 'T11:00:00'),
            status: 'Booked',
            extendedProps: {
              status: 'Booked',
              requestId: request.id
            }
          };
          this.addEvent(event);
        })
      );
    } else {
      console.error('Authorization token is missing!');
      return new Observable();
    }
  }

  private addEvent(event: any): void {
    const currentEvents = this.eventsSubject.getValue();
    currentEvents.push(event);
    this.eventsSubject.next(currentEvents);
  }
}
