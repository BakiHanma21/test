import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { WorkerService } from '../../services/worker.service';
import { Router } from '@angular/router';
import { EditWorkerModalComponent } from '../edit-worker-modal/edit-worker-modal.component';
import { API_URL } from '../../services/auth.service';
@Component({
  selector: 'app-worker-profile',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, CommonModule, MatCardModule, MatIconModule,],
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.css']
})
export class WorkerProfileComponent {
  worker: any = null;
  isEditModalOpen = false;
  editWorker = { ...this.worker };
  isEditWorkModalOpen = false;
  currentEditWork: any = null;
  isChangePasswordModalOpen = false;
  passwordForm = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  };
  passwordError: string = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  isPosted = false; // Flag to track posting status
  postMessage: string = ''; // Message to display when the worker is posted

  constructor(private router: Router,private workerService: WorkerService, private http: HttpClient,public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.get(`${API_URL}/profile`, { headers })
          .subscribe(
            (response: any) => {
              this.worker = response.data || this.worker;
              console.log('Worker profile loaded:', this.worker);
              
              // Log reviews and their ratings
              if (this.worker && this.worker.reviews && this.worker.reviews.length > 0) {
                console.log('Reviews found:', this.worker.reviews.length);
                this.worker.reviews.forEach((review: any, index: number) => {
                  console.log(`Review ${index + 1}:`, review);
                  console.log(`Rating value for review ${index + 1} (before processing):`, review.rating);
                  
                  // Debug actual value from database
                  if (review.rating !== undefined && review.rating !== null) {
                    console.log(`Rating data type: ${typeof review.rating}`);
                    console.log(`Rating stringified: ${JSON.stringify(review.rating)}`);
                  }
                  
                  // Process rating - ensure it's a proper number between 1-5
                  if (review.rating !== undefined && review.rating !== null) {
                    // Convert to number if it's a string
                    if (typeof review.rating === 'string') {
                      review.rating = parseFloat(review.rating);
                      console.log(`Converted rating string to number: ${review.rating}`);
                    } else {
                      review.rating = Number(review.rating);
                    }
                    
                    // Ensure it's within 1-5 range
                    if (isNaN(review.rating)) {
                      review.rating = 0;
                      console.log('Rating was NaN, set to 0');
                    } else if (review.rating < 1) {
                      review.rating = 1;
                      console.log(`Fixed rating to minimum value: ${review.rating}`);
                    } else if (review.rating > 5) {
                      review.rating = 5;
                      console.log(`Fixed rating to maximum value: ${review.rating}`);
                    }
                  } else {
                    // Default to 0 if no rating exists
                    review.rating = 0;
                    console.log('No rating found, defaulting to 0');
                  }
                  
                  console.log(`Final rating for review ${index + 1}:`, review.rating);
                });
              } else {
                console.log('No reviews found for this worker');
              }
            },
            (error) => {
              console.error('Error loading profile:', error);
              if (error.status === 401) {
                alert('Unauthorized! Please log in again.');
                this.router.navigate(['/login']);
              }
            }
          );
      } else {
        this.router.navigate(['/login']);
      }
    }

  deleteProfile() {
    if (confirm('Are you sure you want to delete this profile?')) {
      this.workerService.deleteWorkerProfile(this.worker.id).subscribe(
        (response) => {
          alert('Profile deleted successfully.');
          this.worker = null;
        },
        (error) => {
          console.error('Error deleting profile', error);
          alert('There was an error deleting the profile.');
        }
      );
    }
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  openFileDialog() {
    document.getElementById('fileInput')?.click();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const formData = new FormData();
      
      const userId = localStorage.getItem('user_id');
      formData.append('profile_picture', file);

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post(`${API_URL}/update-worker-picture`, formData, { headers }).subscribe(
          (response: any) => {
            console.log('Upload successful:', response);
            this.loadProfile();
          },
          (error) => {
            if (error.status === 201) {
              console.log('Upload successful:', error);
            this.loadProfile();
            } else {
              console.error('Error uploading profile picture:', error);
            }
          }
        );
      }
    }
  }

  saveChanges() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        const updatedWorkerData = { ...this.editWorker };

        this.http.put(`${API_URL}/update-profile`, updatedWorkerData, { headers })
            .subscribe(
                (response: any) => {
                    this.worker = response.data || this.worker;
                    alert('Profile updated successfully!');
                    this.closeEditModal();
                    window.location.reload();
                },
                (error) => {
                    if (error.status === 422) {
                        alert('Validation error: Please check the input fields.');
                    } else if (error.status === 401) {
                        alert('Unauthorized! Please log in again.');
                        this.router.navigate(['/login']);
                    } else {
                        alert('An error occurred while updating the profile.');
                    }
                }
            );
    } else {
        this.router.navigate(['/login']);
    }
}

  

  postToUserPage(worker: any): void {
    const postUrl = `${API_URL}/postWorker`;
    this.http.post(postUrl, worker).subscribe(
      (response) => {
        console.log('Posted successfully:', response);
        alert('Worker has been posted to the user page!');
        this.isPosted = true;
        this.postMessage = 'This worker has already been posted and cannot be posted again.';
      },
      (error) => {
        console.error('Error posting worker:', error);
        alert('Failed to post the worker.');
      }
    );
  }

  openEditModal() {
    this.isEditModalOpen = true;
    this.editWorker = { ...this.worker };
  }

  openWorkEditModal(work: any) {
    console.log('Original work object:', work);
    this.isEditWorkModalOpen = true;
    this.currentEditWork = { ...work };
    console.log('Copied work object:', this.currentEditWork);
    
    // Debug check for work_id
    if (!this.currentEditWork.work_id) {
      console.warn('Work ID is missing! This will cause the update to fail.');
    }
  }

  closeWorkEditModal() {
    this.isEditWorkModalOpen = false;
    this.currentEditWork = null;
  }

  updateWork() {
    if (!this.currentEditWork) return;

    console.log('Current work being updated:', this.currentEditWork);

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      this.router.navigate(['/login']);
      return;
    }

    const formData = new FormData();
    if (this.currentEditWork.title) {
      formData.append('title', this.currentEditWork.title);
    }
    if (this.currentEditWork.description) {
      formData.append('description', this.currentEditWork.description);
    }
    if (this.currentEditWork.newImage) {
      formData.append('work_image', this.currentEditWork.newImage);
    }

    // Get the work ID specifically using the work_id property
    const workId = this.currentEditWork.work_id;
    
    if (!workId) {
      console.error('Work ID is missing from work object:', this.currentEditWork);
      alert('Error: Work ID is missing. Please try again or contact support.');
      return;
    }

    console.log('Sending request with work ID:', workId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    this.http.post(`${API_URL}/worker-works/${workId}/update-with-image`, 
      formData, { headers }
    ).subscribe(
      (response: any) => {
        this.loadProfile(); // Reload profile to show updated works
        this.closeWorkEditModal();
        alert('Work portfolio updated successfully!');
      },
      (error) => {
        console.error('Error updating work', error);
        if (error.status === 401) {
          alert('Unauthorized! Please log in again.');
          this.router.navigate(['/login']);
        } else {
          alert('Error updating work. Please try again.');
        }
      }
    );
  }

  onWorkImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.currentEditWork.newImage = file;
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentEditWork.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  openWorkImageFileDialog() {
    document.getElementById('workImageInput')?.click();
  }

  openChangePasswordModal() {
    this.isChangePasswordModalOpen = true;
    this.passwordForm = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    };
    this.passwordError = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  closeChangePasswordModal() {
    this.isChangePasswordModalOpen = false;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  changePassword() {
    // Basic validation
    if (this.passwordForm.new_password !== this.passwordForm.new_password_confirmation) {
      this.passwordError = 'New passwords do not match';
      return;
    }

    if (this.passwordForm.new_password.length < 8) {
      this.passwordError = 'New password must be at least 8 characters';
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    this.http.post(`${API_URL}/change-password`, this.passwordForm, { headers })
      .subscribe(
        (response: any) => {
          if (response.success) {
            alert('Password changed successfully');
            this.closeChangePasswordModal();
          } else {
            this.passwordError = response.message || 'An error occurred';
          }
        },
        (error) => {
          console.error('Error changing password:', error);
          if (error.status === 422) {
            this.passwordError = error.error.message || 'Current password is incorrect';
          } else if (error.status === 401) {
            alert('Unauthorized! Please log in again.');
            this.router.navigate(['/login']);
          } else {
            this.passwordError = 'An error occurred while changing the password';
          }
        }
      );
  }
  
  // Helper method to determine if a star should be filled
  shouldFillStar(reviewRating: number, starIndex: number): boolean {
    // This is a critical function for displaying stars correctly
    // For a rating of 1, only the first star (index 0) should be filled
    // For a rating of 2, stars 0 and 1 should be filled, etc.
    console.log(`Star display check - star position: ${starIndex + 1}, rating: ${reviewRating}`);
    const isFilled = starIndex < reviewRating;
    console.log(`Star ${starIndex + 1} filled: ${isFilled}`);
    return isFilled;
  }
  
  // Helper method to get rating value as a number
  getRatingValue(rating: any): number {
    console.log('Getting rating value from:', rating, 'Type:', typeof rating);
    
    if (rating === null || rating === undefined) {
      console.log('Rating is null/undefined, returning 0');
      return 0;
    }
    
    // Process the rating value
    let numRating;
    if (typeof rating === 'string') {
      numRating = parseFloat(rating);
      console.log(`Converted string rating "${rating}" to number: ${numRating}`);
    } else {
      numRating = Number(rating);
      console.log(`Converted rating from ${typeof rating} to number: ${numRating}`);
    }
    
    // Ensure the rating is valid
    if (isNaN(numRating)) {
      console.log('Rating is NaN, returning 0');
      return 0;
    }
    
    // Make sure rating is within valid range (1-5)
    // If rating is outside this range, log it and fix it
    let validRating = numRating;
    if (numRating < 0) {
      validRating = 0;
      console.log(`Rating ${numRating} is less than 0, setting to 0`);
    } else if (numRating > 5) {
      validRating = 5;
      console.log(`Rating ${numRating} is greater than 5, setting to 5`);
    }
    
    console.log(`Final valid rating: ${validRating}`);
    return validRating;
  }
}
