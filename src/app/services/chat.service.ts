import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

interface ChatPayload {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  file_path?: string;
  created_at: string;
  read_at?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private echo: Echo<any> | null = null;
  private channel: any = null;
  private apiUrl = environment.apiUrl;
  private newMessageSubject = new BehaviorSubject<ChatPayload | null>(null);
  public newMessage$ = this.newMessageSubject.asObservable();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    (window as any).Pusher = Pusher;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthorizationToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
    });
  }

  initializeWebSocket(): void {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.warn('User ID not found in localStorage');
      this.connectionStatus.next(false);
      this.router.navigate(['/login']);
      return;
    }

    if (this.echo) {
      console.log('WebSocket already initialized');
      return;
    }

    try {
      this.echo = new Echo({
        broadcaster: 'reverb',
        key: environment.REVERB_APP_KEY,
        wsHost: environment.REVERB_HOST,
        wsPort: +environment.REVERB_PORT,
        wssPort: +environment.REVERB_PORT,
        forceTLS: environment.REVERB_SCHEME === 'https',
        enabledTransports: ['ws'],
        disableStats: true,
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${this.authService.getAuthorizationToken()}`,
          },
        },
      });

      this.channel = this.echo.channel(`chat.${userId}`);
      
      this.channel.listen('.App\\Events\\MessageSent', (event: { chat: ChatPayload }) => {
        console.log('New message received:', event.chat);
        this.newMessageSubject.next(event.chat);
      });

      this.connectionStatus.next(true);
      console.log('WebSocket initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.connectionStatus.next(false);
      setTimeout(() => this.initializeWebSocket(), 5000);
    }
  }

  onNewMessage(callback: (chat: ChatPayload) => void): void {
    if (!this.connectionStatus.value) {
      this.initializeWebSocket();
    }
    
    this.newMessage$.subscribe(message => {
      if (message) {
        callback(message);
      }
    });
  }

  sendMessage(receiverId: number, message: string, file?: File) {
    const formData = new FormData();
    formData.append('receiver_id', receiverId.toString());
    formData.append('message', message);
    if (file) formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/api/send-message`, formData, {
      headers: this.getHeaders()
    });
  }

  getMessages(receiverId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/api/get-messages/${receiverId}`, {
      headers: this.getHeaders()
    });
  }

  getConversations() {
    return this.http.get<any[]>(`${this.apiUrl}/api/conversations`, {
      headers: this.getHeaders()
    });
  }

  markAsRead(receiverId: number) {
    return this.http.post(`${this.apiUrl}/api/mark-as-read/${receiverId}`, {}, {
      headers: this.getHeaders()
    });
  }

  disconnectWebSocket(): void {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
      this.channel = null;
      this.connectionStatus.next(false);
    }
  }
  
  isFromActiveConversation(message: ChatPayload, activeReceiverId: number | null): boolean {
    if (!activeReceiverId) return false;
    
    return (
      (message.sender_id === activeReceiverId) || 
      (message.receiver_id === activeReceiverId)
    );
  }
}