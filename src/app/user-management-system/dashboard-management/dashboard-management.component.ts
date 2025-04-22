import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartData, ChartConfiguration, ChartType } from 'chart.js/auto';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-management',
  imports: [RouterModule, BaseChartDirective, NgStyle, NgClass, NgIf, CommonModule, FormsModule],
  templateUrl: './dashboard-management.component.html',
  styleUrls: ['./dashboard-management.component.css'],
  standalone: true
})
export class DashboardManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  sidebarOpen = true;
  totalUsers: number = 0;
  totalSkilledWorkers: number = 0;

  // Chart settings
  chartType: ChartType = 'bar';
  chartTypeOptions = [
    { value: 'bar' as ChartType, label: 'Bar Chart', icon: 'bar_chart' },
    { value: 'line' as ChartType, label: 'Line Chart', icon: 'show_chart' },
    { value: 'pie' as ChartType, label: 'Pie Chart', icon: 'pie_chart' },
    { value: 'doughnut' as ChartType, label: 'Doughnut', icon: 'donut_large' },
    { value: 'polarArea' as ChartType, label: 'Polar Area', icon: 'radar' }
  ];

  colorTheme: string = 'default';
  colorThemeOptions = [
    { value: 'default', label: 'Default Theme' },
    { value: 'pastel', label: 'Pastel Colors' },
    { value: 'neon', label: 'Neon Colors' },
    { value: 'monochrome', label: 'Monochrome' }
  ];

  chartSettings = {
    showLegend: true,
    showGridLines: true,
    enableAnimations: true,
    rounded: false
  };

  showTrendLine: boolean = false;

  // Chart data
  barChartData: ChartData = {
    labels: ['Total Registered'],
    datasets: [
      {
        label: 'Users',
        data: [0],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Skilled Workers',
        data: [0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initializeChat();
    this.totalUsers = 350;
    this.totalSkilledWorkers = 180;
    this.updateChart();
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
          // Update both datasets
          this.barChartData.datasets[0].data = [this.totalUsers];
          this.barChartData.datasets[1].data = [this.totalSkilledWorkers];
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

  setChartType(type: ChartType): void {
    this.chartType = type;
    this.updateChart();
  }

  updateChartTheme(): void {
    const themes = {
      default: {
        users: { bg: 'rgba(75, 192, 192, 0.5)', border: 'rgba(75, 192, 192, 1)' },
        workers: { bg: 'rgba(255, 99, 132, 0.5)', border: 'rgba(255, 99, 132, 1)' }
      },
      pastel: {
        users: { bg: 'rgba(187, 222, 251, 0.5)', border: 'rgba(100, 181, 246, 1)' },
        workers: { bg: 'rgba(255, 224, 178, 0.5)', border: 'rgba(255, 167, 38, 1)' }
      },
      neon: {
        users: { bg: 'rgba(0, 255, 255, 0.5)', border: 'rgba(0, 255, 255, 1)' },
        workers: { bg: 'rgba(255, 0, 255, 0.5)', border: 'rgba(255, 0, 255, 1)' }
      },
      monochrome: {
        users: { bg: 'rgba(70, 70, 70, 0.5)', border: 'rgba(70, 70, 70, 1)' },
        workers: { bg: 'rgba(130, 130, 130, 0.5)', border: 'rgba(130, 130, 130, 1)' }
      }
    };

    const selectedTheme = themes[this.colorTheme as keyof typeof themes];
    if (this.barChartData.datasets[0] && this.barChartData.datasets[1]) {
      this.barChartData.datasets[0].backgroundColor = selectedTheme.users.bg;
      this.barChartData.datasets[0].borderColor = selectedTheme.users.border;
      this.barChartData.datasets[1].backgroundColor = selectedTheme.workers.bg;
      this.barChartData.datasets[1].borderColor = selectedTheme.workers.border;
    }
    
    if (this.chart) {
      this.chart.update();
    }
  }

  updateChart(): void {
    if (this.barChartOptions?.plugins?.legend && this.barChartOptions.scales) {
      // Update chart options based on settings
      this.barChartOptions.plugins.legend.display = this.chartSettings.showLegend;
      
      if ('y' in this.barChartOptions.scales && 'x' in this.barChartOptions.scales) {
        const yScale = this.barChartOptions.scales['y'];
        const xScale = this.barChartOptions.scales['x'];
        
        if (yScale && xScale && 'grid' in yScale && 'grid' in xScale) {
          if (yScale.grid && xScale.grid) {
            yScale.grid.display = this.chartSettings.showGridLines;
            xScale.grid.display = this.chartSettings.showGridLines;
          }
        }
      }
    }

    if (this.chartSettings.rounded && this.chartType === 'bar') {
      this.barChartData.datasets.forEach(dataset => {
        (dataset as any).borderRadius = 5;
        (dataset as any).borderSkipped = false;
      });
    } else {
      this.barChartData.datasets.forEach(dataset => {
        delete (dataset as any).borderRadius;
        delete (dataset as any).borderSkipped;
      });
    }

    // Add trend line if enabled
    if (this.showTrendLine && (this.chartType === 'line' || this.chartType === 'bar')) {
      const firstDataset = this.barChartData.datasets[0];
      if (firstDataset && Array.isArray(firstDataset.data)) {
        const trendLineData = this.calculateTrendLine(firstDataset.data as number[]);
        if (this.barChartData.datasets.length === 3) {
          this.barChartData.datasets.pop();
        }
        this.barChartData.datasets.push({
          label: 'Trend',
          data: trendLineData,
          type: 'line' as ChartType,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        });
      }
    } else if (this.barChartData.datasets.length === 3) {
      this.barChartData.datasets.pop();
    }
  }

  calculateTrendLine(data: number[]): number[] {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((_, i) => slope * i + intercept);
  }

  exportChartData(): void {
    if (this.barChartData.labels && this.barChartData.datasets[0]?.data && this.barChartData.datasets[1]?.data) {
      const csvContent = [
        ['Month', 'Users', 'Skilled Workers'],
        ...this.barChartData.labels.map((label, index) => [
          label,
          this.barChartData.datasets[0].data[index],
          this.barChartData.datasets[1].data[index]
        ])
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'chart_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}