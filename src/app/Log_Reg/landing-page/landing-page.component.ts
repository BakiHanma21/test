import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize any required data

    // Add Material Icons link to the document head if not already present
    if (!document.querySelector('link[href*="material-icons"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  private initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe all elements with animation classes
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in')
      .forEach(element => observer.observe(element));
  }

  gotoLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome() {
    // Add smooth scroll before navigation
    const roleSection = document.querySelector('.role-choice-section');
    if (roleSection) {
      roleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 800);
  }

  goToWorkerRegistration() {
    // Add smooth scroll before navigation
    const roleSection = document.querySelector('.role-choice-section');
    if (roleSection) {
      roleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      this.router.navigate(['/skilled-registration']);
    }, 800);
  }

  goToAboutUs() {
    this.router.navigate(['/about_us']);
  }

  goToContact() {
    this.router.navigate(['/contact_us']);
  }

  goToTerms() {
    this.router.navigate(['/terms-conditions']);
  }
}
