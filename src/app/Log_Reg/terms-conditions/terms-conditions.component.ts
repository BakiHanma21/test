import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TermsAndConditionsComponent implements OnInit {
  activeSection: string = 'section1';
  
  constructor(private router: Router) { }

  ngOnInit(): void {
    // Add Material Icons link to the document head if not already present
    if (!document.querySelector('link[href*="material-icons"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      this.activeSection = sectionId;
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navigateBack(): void {
    this.router.navigate(['/login']);
  }

  isActiveSection(sectionId: string): boolean {
    return this.activeSection === sectionId;
  }
}