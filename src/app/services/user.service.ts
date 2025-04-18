import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthorizationToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
    });
  }

  getPotentialChatUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/potential-chat-users`, {
      headers: this.getHeaders()
    });
  }
}
