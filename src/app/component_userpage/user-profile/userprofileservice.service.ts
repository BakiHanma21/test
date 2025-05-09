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

  updateUserProfile(userData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.apiUrl}/update-user-profile`, userData, { 
      headers: headers 
    });
  }
  
  updateProfileImage(imageFile: File): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.http.post(`${this.apiUrl}/update-profile-image`, formData, {
      headers: headers
    });
  }

  changeUserPassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    
    const passwordData = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation
    };
    
    return this.http.post(`${this.apiUrl}/change-user-password`, passwordData, {
      headers: headers
    });
  }
}