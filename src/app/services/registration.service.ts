import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  private apiUrl = 'http://localhost/Service_express_api/registration.php';  // Replace with your PHP backend URL

  constructor(private http: HttpClient) { }

  registerUser(formData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    });
  }
}
