import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_URL = 'http://localhost:8000/';

@Injectable({
  providedIn: 'root'
})
export class UserprofileserviceService {
  private apiUrl = 'http://localhost:8000/api';
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/view-user-profile`, { headers });
  }

  updateUserProfile(formData: FormData): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/update-user-profile`, formData, { 
      headers: headers 
    });
  }
  
  updateProfileImage(imageFile: File): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    
    return this.http.post(`${this.apiUrl}/update-profile-image`, formData, {
      headers: headers
    });
  }

  
}