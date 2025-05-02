import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.css']
})
export class AdminNavigationComponent implements OnInit {
  sidebarOpen = true;
  sidebarCollapsed = false;
  isMobile = false;

  constructor(private router: Router) {
    this.checkScreenSize();
  }

  ngOnInit() {
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.sidebarOpen = false;
      this.sidebarCollapsed = false;
    } else {
      this.sidebarOpen = true;
      this.sidebarCollapsed = false;
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleCollapse() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    // Implement your logout logic here
    localStorage.removeItem('token'); // Remove the auth token
    this.router.navigate(['/login']); // Navigate to login page
  }

  // Optional: Clean up the event listener when component is destroyed
  ngOnDestroy() {
    window.removeEventListener('resize', () => {
      this.checkScreenSize();
    });
  }
}
