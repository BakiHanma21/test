import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Worker } from './worker.model';
import { API_URL } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {


  constructor(private http: HttpClient) {}

  addWorker(worker: Worker): Observable<any> {
    return this.http.post(`${API_URL}/createWorker.php`, worker);
  }

  getWorkers(): Observable<Worker[]> {
    return this.http.get<Worker[]>(`${API_URL}/workers`);
  }

  updateWorker(worker: Worker): Observable<any> {
    return this.http.put(`${API_URL}/updateWorker.php`, worker);
  }
  // worker.service.ts
  deleteWorkerProfile(workerId: string): Observable<any> {
    const url = `${API_URL}/delete_worker.php?id=${workerId}`; // Append workerId directly in the query string
    return this.http.delete(url); // Make the DELETE request to the correct URL
  }
  

}

