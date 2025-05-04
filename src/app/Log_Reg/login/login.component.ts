import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  formError: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.formError = 'Username and Password are required.';
      return;
    }

    this.loading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        const userId = response.user?.id ?? response.id;
        const token = response.token ?? response.access_token;
        const role = response.user?.role ?? response.role;
        const user = response.user ?? response;

        if (!userId || !token || !role) {
          console.error('Missing required fields in response:', { userId, token, role });
          this.formError = 'Invalid response from server. Please try again.';
          this.loading = false;
          return;
        }

        // Use AuthService to set user_id
        this.authService.setUserId(userId.toString());
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', role);

        this.redirectBasedOnRole(role);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.handleLoginError(error);
      },
    });
  }

  navigateToChoices() {
    this.router.navigate(['/choices']);
  }

  private redirectBasedOnRole(role: string) {
    console.log('Redirecting based on role:', role);
    if (role === 'USER') {
      this.router.navigate(['/home']);
    } else if (role === 'WORKER') {
      this.router.navigate(['/profile']);
    } else if (role === 'ADMINISTRATOR') {
      this.router.navigate(['/dashboard-management']);
    } else {
      this.formError = 'Invalid user role.';
    }
    this.loading = false;
  }

  private handleLoginError(error: any) {
    console.error('Login Error Details:', error);

    if (error.status === 403 && error.error?.error === 'Your account is disabled. Please contact support.') {
      this.formError = 'Your account is disabled. Please Check your Email for more information.';
    } else if (error.status === 403 && error.error?.error === 'Your account is under verification. Please wait.') {
      this.formError = 'Your account is under verification. Please wait.';
    } else {
      this.formError = error.error?.message || 'An unknown error occurred.';
    }

    this.loading = false;
  }

  goToSignUp() {
    this.router.navigate(['/user-registration']);
  }

  goToSignUpworker() {
    this.router.navigate(['/skilled-registration']);
  }

  navigateToRegister() {
    this.router.navigate(['/choices']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  navigateToHomepage() {
    this.router.navigate(['/']); // This will navigate to the landing page
  }
}