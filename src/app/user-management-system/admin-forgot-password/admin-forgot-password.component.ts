import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-forgot-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-forgot-password.component.html',
  styleUrl: './admin-forgot-password.component.css'
})
export class AdminForgotPasswordComponent {
  email: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.email) {
      alert(`Password reset instructions have been sent to ${this.email}.`);
      this.router.navigate(['/admin-login']); // Navigate back to login
    } else {
      alert('Please enter a valid email address.');
    }
  }

  navigateToLogin() {
    this.router.navigate(['/admin-login']);
  }
}
