import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartData, ChartConfiguration } from 'chart.js';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';
import { NgStyle, NgClass } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-dashboard-management',
  imports: [RouterModule, BaseChartDirective, NgStyle, NgClass],
  templateUrl: './dashboard-management.component.html',
  styleUrls: ['./dashboard-management.component.css'],
})
export class DashboardManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  sidebarOpen = true;
  totalUsers: number = 0;
  totalSkilledWorkers: number = 0;
  barChartData: ChartData<'bar'> = {
    labels: ['Total Users', 'Total Skilled Workers'],
    datasets: [
      {
        data: [0, 0],
        label: 'Total Count',
        backgroundColor: 'rgba(0, 123, 255, 0.6)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initializeChat();
  }

  ngAfterViewInit(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  loadData(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`http://localhost:8000/api/dashboard-admin`, { headers }).subscribe(
        (response: any) => {
          this.totalUsers = response.totalUsers;
          this.totalSkilledWorkers = response.totalSkilledWorkers;
          this.barChartData.datasets[0].data = [this.totalUsers, this.totalSkilledWorkers];
          if (this.chart) {
            this.chart.update();
          }
        },
        (error) => {
          if (error.status === 401) {
            alert('Unauthorized! Please log in again.');
            this.router.navigate(['/login']);
          }
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSidebarInside() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.chatService.disconnectWebSocket(); // Disconnect WebSocket on logout
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }

  private initializeChat(): void {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    if (userId && authToken) {
      this.chatService.initializeWebSocket();
      this.chatService.onNewMessage((chat) => {
        console.log('New message received:', chat);
      });
    }
  }
}