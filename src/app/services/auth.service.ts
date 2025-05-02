import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export const API_URL = 'http://localhost:8000/api';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginData = { username, password };
    return this.http.post<any>(`${API_URL}/login`, loginData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  setUserId(id: string) {
    localStorage.setItem('user_id', id);
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }

  getAuthorizationToken(): string | null {
    return localStorage.getItem('authToken');
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/forgot-password`, { email }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });    
  }

  completePasswordReset(email: string, token: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/reset-password`, {
      email,
      token,
      password,
      password_confirmation
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}