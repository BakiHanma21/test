import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestCalendarService } from '../../services/requestcalendar.service';
import { API_URL } from '../../services/auth.service';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-worker-request-list',
  templateUrl: './worker-request-list.component.html',
  styleUrls: ['./worker-request-list.component.css']
})
export class WorkerRequestListComponent1 implements OnInit {
  requests: any[] = [];
  selectedRequest: any;
  userId = this.getUserId();

  constructor(
    private http: HttpClient,
    private router: Router,
    private requestCalendarService: RequestCalendarService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`${API_URL}/workers/${this.userId}/requests`, { headers })
        .subscribe(
          (response: any) => {
            console.log(response);
            this.requests = response.data || [];
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            } else {
              console.error('Failed to load requests:', error);
            }
          }
        );
    } else {
      this.router.navigate(['/login']);
    } 
  }

  getUserId(): string {
    const role = localStorage.getItem('user_id');
    return role ? role : 'default';
  }

  onMessage(request: any) {
    request.showMessageModal = true;
    this.selectedRequest = request;
  }

  openModal(request: any): void {
    this.selectedRequest = request;
  }
  
  closeModal(): void {
    this.selectedRequest = null;
  }
  

  closeMessageModal() {
    if (this.selectedRequest) {
      this.selectedRequest.showMessageModal = false;
    }
  }

  onApprove(request: any) {
    // Make sure we have the full request object
    const requestId = request.id;
    
    if (requestId) {
      this.updateRequestStatus(requestId, 'CONFIRMED');
      this.requestCalendarService.approveRequest(request).subscribe(
        (response: any) => {
          console.log('Request successfully confirmed:', response);
          alert('Request successfully approved!');
          this.router.navigate(['/bookings']);
        },
        (error: any) => {
          console.error('Error confirming request:', error);
        }
      );
    } else {
      console.error('Invalid request object!');
    }
  }

  private updateRequestStatus(requestId: string, status: string) {
    const request = this.requests.find(req => req.id === requestId);
    if (request) {
      request.status = status;
    }
  }
  

  onDecline(requestId: string) {
    const request = this.requests.find(req => req.id === requestId);
    if (request) {
      request.status = 'Declined';
      console.log(`Request ${requestId} is now Declined`);
    }
  }

  onViewRequest(request: any) {
    this.selectedRequest = request;
  }

  sendMessage(request: any) {
    const message = `The proposed cost for your service is ${request.proposedCost}. Please confirm if you agree to this cost.`;
    console.log('Message sent:', message);
    request.status = 'Message Sent';
  }
}
