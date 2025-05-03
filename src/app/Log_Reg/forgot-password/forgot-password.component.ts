import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Add Material Icons link to the document head if not already present
    if (!document.querySelector('link[href*="material-icons"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;
    
    this.authService.resetPassword(this.email).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Password reset link has been sent to your email!';
        this.errorMessage = '';
        this.loading = false;
        
        // Clear the form
        this.email = '';

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.navigateToLogin();
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to send reset email. Please try again.';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }  

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
