import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-registration',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-registration.component.html',
  styleUrl: './admin-registration.component.css'
})
export class AdminRegistrationComponent {
  formData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  passwordVisible = false;
  confirmPasswordVisible = false;
  formSubmitted = false;

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    this.formSubmitted = true;

    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const requestBody = {
      username: this.formData.username,
      email: this.formData.email,
      password: this.formData.password,
    };

    this.http
      .post('http://localhost/UMS-api/registration.php', requestBody)
      .subscribe(
        (response: any) => {
          if (response.message === 'Registration successful') {
            alert('Registration successful!');
            this.router.navigate(['/admin-login']);
          } else {
            alert('Error: ' + response.message);
          }
        },
        (error) => {
          alert('An error occurred: ' + error.message);
        }
      );
  }

  // Toggle password visibility
  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else if (field === 'confirmPassword') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  goToLogin() {
    this.router.navigate(['/admin-login']);
  }
}
