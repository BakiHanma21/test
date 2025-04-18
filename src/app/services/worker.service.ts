import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Worker } from './worker.model';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  addWorker(worker: Worker): Observable<any> {
    return this.http.post(`${this.apiUrl}/createWorker.php`, worker);
  }

  getWorkers(): Observable<Worker[]> {
    return this.http.get<Worker[]>(`${this.apiUrl}/workers`);
  }

  updateWorker(worker: Worker): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateWorker.php`, worker);
  }
  // worker.service.ts
  deleteWorkerProfile(workerId: string): Observable<any> {
    const url = `${this.apiUrl}/delete_worker.php?id=${workerId}`; // Append workerId directly in the query string
    return this.http.delete(url); // Make the DELETE request to the correct URL
  }
  

}

