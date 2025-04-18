import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:8000/api/login';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginData = { username, password };
    return this.http.post<any>(this.apiUrl, loginData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  setUserId(id: string) {
    localStorage.setItem('user_id', id);
  }

  getUserId() {
    return localStorage.getItem('user_id');
  }

  logout() {
    localStorage.removeItem('user_id');
  }
}
