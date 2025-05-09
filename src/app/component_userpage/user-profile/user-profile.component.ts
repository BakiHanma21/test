import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { API_URL, UserprofileserviceService } from './userprofileservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  image?: string;
  purok?: string;
  street?: string;
  rating?: number;
  created_at?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  userProfile: UserProfile = {
    name: '',
    email: '',
    phone: '',
    location: '',
    image: 'assets/default-profile.png'
  };
  
  isLoading = false;
  isEditing = false;
  editableProfile: UserProfile = { ...this.userProfile };
  memberSince: string = '';
  
  // Image update related properties
  private fileToUpload: File | null = null;
  newImageSelected = false;
  previewImageUrl: string | ArrayBuffer | null = null;

  // Password change related properties
  isChangingPassword = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: ''
  };
  passwordError: string = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private userProfileService: UserprofileserviceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userProfileService.getUserProfile().subscribe({
      next: (response) => {
        console.log('Profile data:', response);
        if (response && response.status === 'success' && response.data) {
          this.userProfile = response.data;
          
          // Format the created_at date for display
          if (this.userProfile.created_at) {
            const createdDate = new Date(this.userProfile.created_at);
            this.memberSince = createdDate.toLocaleDateString('en-US', {
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            });
          }
          
          // Ensure we have default values for optional fields
          if (!this.userProfile.image) {
            this.userProfile.image = 'assets/user-icon.jpg';
          } else if (this.userProfile.image && !this.userProfile.image.includes('http')) {
            // If it's a relative path, prepend the storage URL
            this.userProfile.image = `${API_URL}${this.userProfile.image}`;
          }

          this.editableProfile = { ...this.userProfile };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
        this.showNotification('Failed to load profile information');
      }
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form if canceling edit
      this.editableProfile = { ...this.userProfile };
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    
    // Create profile update data object
    const profileData = {
      name: this.editableProfile.name,
      email: this.editableProfile.email,
      phone: this.editableProfile.phone || null,
      location: this.editableProfile.location || null,
      purok: this.editableProfile.purok || null,
      street: this.editableProfile.street || null
    };
    
    this.userProfileService.updateUserProfile(profileData).subscribe({
      next: (response) => {
        if (response && response.status === 'success') {
          this.userProfile = response.data;
          
          // Ensure we have the proper image URL
          if (this.userProfile.image && !this.userProfile.image.includes('http')) {
            this.userProfile.image = `${API_URL}${this.userProfile.image}`;
          }
          
          this.editableProfile = { ...this.userProfile };
          this.isLoading = false;
          this.isEditing = false;
          this.showNotification('Profile updated successfully');
        } else {
          this.showNotification('Something went wrong. Please try again.');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;
        this.showNotification(error.error?.message || 'Failed to update profile');
      }
    });
  }

  // Profile image update methods
  openImageUpload(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result;
        this.newImageSelected = true;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelImageUpdate(): void {
    this.fileToUpload = null;
    this.previewImageUrl = null;
    this.newImageSelected = false;
  }

  updateProfileImage(): void {
    if (!this.fileToUpload) return;
    
    this.isLoading = true;
    this.userProfileService.updateProfileImage(this.fileToUpload).subscribe({
      next: (response) => {
        if (response && response.status === 'success') {
          // Update profile image in the model
          if (response.image) {
            this.userProfile.image = `${API_URL}${response.image}`;
          } else if (response.image_url) {
            this.userProfile.image = response.image_url;
          }
          
          this.editableProfile = { ...this.userProfile };
          this.showNotification('Profile image updated successfully');
        } else {
          this.showNotification('Failed to update profile image');
        }
        
        this.isLoading = false;
        this.newImageSelected = false;
        this.fileToUpload = null;
        this.previewImageUrl = null;
      },
      error: (error) => {
        console.error('Error updating profile image:', error);
        this.isLoading = false;
        this.showNotification('Failed to update profile image');
        this.fileToUpload = null;
        this.previewImageUrl = null;
        this.newImageSelected = false;
      }
    });
  }

  getFullAddress(): string {
    const parts = [];
    if (this.userProfile.purok) parts.push(`Purok ${this.userProfile.purok}`);
    if (this.userProfile.street) parts.push(this.userProfile.street);
    if (this.userProfile.location) parts.push(this.userProfile.location);
    
    return parts.join(', ') || 'No address provided';
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  // Password change related methods
  togglePasswordChangeForm(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (this.isChangingPassword) {
      // Reset the form when opening
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: ''
      };
      this.passwordError = '';
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
    }
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  changePassword(): void {
    // Basic validation
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.newPasswordConfirmation) {
      this.passwordError = 'All fields are required';
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.passwordError = 'New password must be at least 8 characters';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.newPasswordConfirmation) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    this.isLoading = true;
    this.passwordError = '';

    this.userProfileService.changeUserPassword(
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword,
      this.passwordForm.newPasswordConfirmation
    ).subscribe({
      next: (response) => {
        if (response && response.status === 'success') {
          this.showNotification('Password changed successfully');
          this.togglePasswordChangeForm(); // Close the form
        } else {
          this.passwordError = response.message || 'An error occurred';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        if (error.status === 422) {
          this.passwordError = error.error.message || 'Current password is incorrect';
        } else {
          this.passwordError = 'An error occurred while changing the password';
        }
        this.isLoading = false;
      }
    });
  }
}
