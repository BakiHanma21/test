import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.email) {
      this.authService.resetPassword(this.email).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Password reset link has been sent!';
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'Failed to send reset email. Please try again.';
          this.successMessage = '';
        }
      });
    } else {
      this.errorMessage = 'Please enter a valid email address.';
    }
  }  

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
