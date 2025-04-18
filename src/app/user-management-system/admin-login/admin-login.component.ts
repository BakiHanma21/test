import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  passwordVisible: boolean = false;
  formSubmitted = false;

  constructor(private loginService: LoginService, private router: Router, private http: HttpClient) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    this.formSubmitted = true;

    const requestBody = { username: this.username, password: this.password };

    this.http
      .post('http://localhost/UMS-api/login.php', requestBody)
      .subscribe(
        (response: any) => {
          if (response.message === 'Login successful') {
            alert('Welcome, ' + response.user.username);
            this.router.navigate(['/dashboard-management']);
          } else {
            alert('Error: ' + response.message);
          }
        },
        (error) => {
          alert('An error occurred: ' + error.message);
        }
      );
  }

  navigateToRegister() {
    this.router.navigate(['/admin-registration']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/admin-forgot-password']);
  }
}
