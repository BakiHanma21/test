import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { Router } from '@angular/router';
import { TermsAndConditionsComponent } from '../terms-conditions/terms-conditions.component';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, TermsAndConditionsComponent],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css'],
})
export class UserRegistrationComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    confirmPassword: '',
    purok: '',  // Added district/purok field
    street: '', // Added street field
    profilePicture: '',
    termsAgreement: false
  };

  profilePictureError: string | null = null;
  formSubmitted = false;
  showTermsModal = false;

  constructor(private registrationService: RegistrationService, private router: Router, private http: HttpClient) {}

  onRegister() {
    this.formSubmitted = true;

    if (!this.formData.termsAgreement) {
      alert('Kailangan mong sumang-ayon sa mga Tuntunin at Kundisyon upang magpatuloy.');
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('email', this.formData.email);
    formData.append('password', this.formData.password);
    formData.append('profile_picture', this.formData.profilePicture);
    formData.append('purok', this.formData.purok);       // Add purok/district
    formData.append('street', this.formData.street);     // Add street
    formData.append('phone_number', this.formData.phoneNumber);
    formData.append('terms_accepted', 'true');
    

    this.http.post('http://localhost:8000/api/user-signup', formData, { observe: 'response' })
      .subscribe(
        (response: any) => {
            alert('Registration successful! Please wait while we verify your account.');
            this.router.navigate(['/login']);
        },
        (error) => {
          if (error.status === 201) {
            alert('Registration successful! Please wait while we verify your account.');
            this.router.navigate(['/login']);
          } else {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
          }
        }
      );
  }

  onProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.size <= 2048 * 1024) {
      this.formData.profilePicture = file;
      this.profilePictureError = null;
    } else {
      this.profilePictureError = 'Profile picture must be an image and less than 2MB.';
    }
  }

  openTermsModal(event: Event): void {
    event.preventDefault();
    this.showTermsModal = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }

  acceptTerms(): void {
    this.formData.termsAgreement = true;
    this.closeTermsModal();
  }
}