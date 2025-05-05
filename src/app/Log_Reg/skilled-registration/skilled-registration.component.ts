import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TermsAndConditionsComponent } from '../terms-conditions/terms-conditions.component';

@Component({
  selector: 'app-skilled-registration',
  standalone: true,
  imports: [FormsModule, CommonModule, TermsAndConditionsComponent],
  templateUrl: './skilled-registration.component.html',
  styleUrls: ['./skilled-registration.component.css']
})
export class SkilledRegistrationComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  formSubmitted = false;
  showTermsModal = false;
  profilePictureError: string | null = null;
  floatingIcons: { icon: string, top: string, left: string, right?: string, bottom?: string, size: string, duration: string }[] = [];
  showStepError = false;

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

  showPassword = false;
  showConfirmPassword = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Initialize the floating icons programmatically if needed
    this.initFloatingIcons();
  }

  initFloatingIcons(): void {
    // This function can be expanded to create floating icons dynamically if needed
    // Currently the icons are defined in the template, but this can be used for more dynamic behavior
    console.log('Floating icons initialized');
  }

  getStepLabel(): string {
    switch (this.currentStep) {
      case 1:
        return 'Personal Information';
      case 2:
        return 'Security Information';
      case 3:
        return 'Professional Information';
      case 4:
        return 'Work Examples';
      default:
        return '';
    }
  }

  goToStep(step: number): void {
    // Prevent going to future steps directly
    if (step > this.currentStep) {
      return;
    }
    // Allow going back to previous steps
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.showStepError = false;
    }
  }

  nextStep(form: NgForm): void {
    this.showStepError = false;
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        const formElement = document.querySelector('.registration-form-card');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      this.showStepError = true;
      // Mark all fields in current step as touched to trigger validation
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Add smooth scroll to top of form
      const formElement = document.querySelector('.registration-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  onSubmit(skilledRegistrationForm: NgForm) {
    this.formSubmitted = true;
    
    // Check if images are provided
    if (!this.user.image) {
      this.profilePictureError = 'Profile picture is required.';
      return;
    }
    
    if (!this.user.valid_id) {
      alert('Valid ID is required.');
      return;
    }
    
    if (!this.user.work_examples[0].image || !this.user.work_examples[1].image) {
      alert('All work example images are required.');
      return;
    }
    
    if (skilledRegistrationForm.invalid) {
      return;
    }

    // Check terms agreement
    if (!this.user.termsAgreement) {
      alert('You must agree to the Terms and Conditions to continue.');
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

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.user.name?.trim() && 
                 this.user.email?.trim() && 
                 this.user.phoneNumber?.trim() &&
                 this.user.phoneNumber.length === 11 &&
                 this.isValidEmail(this.user.email));
      case 2:
        return !!(this.user.password?.trim() && 
                 this.user.confirmPassword?.trim() && 
                 this.user.password === this.user.confirmPassword &&
                 this.user.password.length >= 8 &&
                 this.user.image);
      case 3:
        return !!(this.user.location?.trim() && 
                 this.user.skills?.trim() && 
                 this.user.years_of_experience &&
                 this.user.valid_id);
      case 4:
        return true; // Final step validation is handled by form submit
      default:
        return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
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

  gotoLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToChoices() {
    this.router.navigate(['/choices']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
