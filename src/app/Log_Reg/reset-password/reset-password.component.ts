import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  passwordConfirmation: string = '';
  token: string = '';
  email: string = '';
  error: string = '';
  success: string = '';
  loading: boolean = false;
  passwordMismatch: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Add Material Icons link to the document head if not already present
    if (!document.querySelector('link[href*="material-icons"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Get token and email from URL parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      if (!this.token || !this.email) {
        this.error = 'Invalid password reset link. Please request a new one.';
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.passwordMismatch = false;
    
    // Validate passwords match
    if (this.password !== this.passwordConfirmation) {
      this.passwordMismatch = true;
      return;
    }

    // Validate password requirements
    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters long';
      return;
    }

    this.loading = true;
    
    this.authService.completePasswordReset(
      this.email, 
      this.token, 
      this.password, 
      this.passwordConfirmation
    ).subscribe({
      next: (response) => {
        this.success = 'Your password has been reset successfully!';
        this.loading = false;
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to reset password. The link may have expired.';
        this.loading = false;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}