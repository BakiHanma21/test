import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../../services/auth.service';
import { Observable } from 'rxjs';

export interface Schedule {
  id: number;
  type: 'booking' | 'transaction';
  title: string;
  description: string;
  date: string;
  end_date?: string;
  time?: string;
}

export interface WorkerSchedule {
  worker_info: {
    id: number;
    name: string;
  };
  schedules: Schedule[];
  available_slots: any[];
  conflicts?: {
    type: 'booking' | 'transaction';
    date: string;
    time?: string;
    title: string;
  }[];
}

export interface WorkerAvailability {
  isAvailable: boolean;
  conflicts: {
    type: 'booking' | 'transaction';
    date: string;
    time?: string;
    title: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) { }

  getWorkerSchedule(workerId: number): Observable<WorkerSchedule> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    return this.http.get<WorkerSchedule>(`${API_URL}/workers/${workerId}/schedule`, { headers });
  }

  checkWorkerAvailability(workerId: number, date: string, time: string): Observable<WorkerAvailability> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    return this.http.get<WorkerAvailability>(`${API_URL}/workers/${workerId}/check-availability`, { 
      headers,
      params: {
        date,
        time
      }
    });
  }
}
