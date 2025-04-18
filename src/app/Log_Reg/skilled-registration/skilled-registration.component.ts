import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TermsAndConditionsComponent } from '../terms-conditions/terms-conditions.component';

@Component({
  selector: 'app-skilled-registration',
  standalone: true, // Ensure this is a standalone component
  imports: [FormsModule, CommonModule, TermsAndConditionsComponent], // Import FormsModule
  templateUrl: './skilled-registration.component.html',
  styleUrls: ['./skilled-registration.component.css']
})
export class SkilledRegistrationComponent {
  formSubmitted = false;
  showTermsModal = false; 
  user = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    image: '',
    confirmPassword: '',
    location: '',
    skills: '',
    valid_id: '',
    years_of_experience: '',
    termsAgreement: false,
    work_examples: [
      { title: '', description: '', image: '' },
      { title: '', description: '', image: '' }
    ]
  };
  

  profilePictureError: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(skilledRegistrationForm: NgForm) {
    if (skilledRegistrationForm.invalid) {
      return;
    }

     // Check terms agreement
     if (!this.user.termsAgreement) {
      alert('Kailangan mong sumang-ayon sa mga Tuntunin at Kundisyon upang magpatuloy.');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('email', this.user.email);
    formData.append('phoneNumber', this.user.phoneNumber);
    formData.append('profile_picture', this.user.image);
    formData.append('password', this.user.password);
    formData.append('confirmPassword', this.user.confirmPassword);
    formData.append('location', this.user.location);
    formData.append('skills', this.user.skills);
    formData.append('valid_id', this.user.valid_id);
    formData.append('years_of_experience', this.user.years_of_experience);
    formData.append('terms_accepted', 'true');
  
    for (let i = 0; i < 2; i++) {
      formData.append(`work_example_${i + 1}_title`, this.user.work_examples[i].title);
      formData.append(`work_example_${i + 1}_description`, this.user.work_examples[i].description);
      formData.append(`work_example_${i + 1}_image`, this.user.work_examples[i].image);
    }
  
    this.http.post('http://localhost:8000/api/worker-signup', formData)
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
            alert('Registration failed. Please try again.');
          console.error('Error during registration:', error);
          }
        }
      );
  }
  

  navigateToChoices() {
    this.router.navigate(['/choices']);
  }

  gotoLogin() {
    this.router.navigate(['/login']);
  }

  onProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.size <= 2048 * 1024) { // 2MB max size
      this.user.image = file;
      this.profilePictureError = null;
    } else {
      this.profilePictureError = 'Profile picture must be an image and less than 2MB.';
    }
  }

  onValidIdChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.user.valid_id = file;
    }
  }
  
  onWorkExampleImageChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.user.work_examples[index].image = file;
    }
  }  

   // Add these methods for terms and conditions modal
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
    this.user.termsAgreement = true;
    this.closeTermsModal();
  }
}
