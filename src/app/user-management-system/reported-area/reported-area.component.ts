import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';;
import { API_URL } from '../../services/auth.service';
interface Report {
  id: number;
  date: Date;
  name: string;
  reported_person: string;
  reason: string;
  description: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-reported-area',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reported-area.component.html',
  styleUrl: './reported-area.component.css'
})
export class ReportedAreaComponent {
  reports: Report[] = [];

  isReplying = false;
  currentReport: any;
  response: string = '';
  sidebarOpen = true;
  filteredUsers = this.reports;
  searchTerm = '';

  constructor(private http: HttpClient, private router: Router) {}

  searchUser() {
    if (this.searchTerm.trim() === '') {
      this.filteredUsers = this.reports;  // Show all if the search term is empty
    } else {
      this.filteredUsers = this.reports.filter(user => 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  ngOnInit(): void {
    this.loadreports();
  }

  loadreports(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`${API_URL}/show-reports`, { headers })
        .subscribe(
          (response: any) => {
            console.log('Profile Response:', response);
            this.filteredUsers = response;
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            } else if (error.status === 500) {
              alert('Server error! Please try again later.');
            } else {
              console.error('Error loading profile:', error);
              alert('An error occurred while loading the reports.');
            }
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  }
  

  openReplyForm(report: any) {
    this.isReplying = true;
    this.currentReport = report;  // Store the report details for the reply
  }

  closeReplyForm() {
    this.isReplying = false;
    this.response = '';  // Clear response when closing the form
  }

  sendReply() {
    alert(`Reply sent to ${this.currentReport.email}: ${this.response}`);

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`${API_URL}/send-reports`, { headers })
        .subscribe(
          (response: any) => {
            this.filteredUsers = response;
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            } else if (error.status === 500) {
              alert('Server error! Please try again later.');
            } else {
              console.error('Error loading profile:', error);
              alert('An error occurred while loading the reports.');
            }
          }
        );
    } else {
      this.router.navigate(['/login']);
    }

    this.closeReplyForm();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  toggleSidebarInside() {
    this.sidebarOpen = !this.sidebarOpen; // Toggle the sidebar visibility
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }
}
