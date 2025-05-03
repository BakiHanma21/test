import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-choices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choices.component.html',
  styleUrls: ['./choices.component.css']
})
export class ChoicesComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Add Material Icons link to the document head if not already present
    if (!document.querySelector('link[href*="material-icons"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  navigateToUserRegistration() {
    this.router.navigate(['/user-registration']);
  }

  navigateToSkilledRegistration() {
    this.router.navigate(['/skilled-registration']);
  }
}
