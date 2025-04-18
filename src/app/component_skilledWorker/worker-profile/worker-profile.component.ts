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
 // Import the modal component
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
        this.http.get(`http://localhost:8000/api/profile`, { headers })
          .subscribe(
            (response: any) => {
              this.worker = response.data || this.worker;
            },
            (error) => {
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
        this.http.post('http://localhost:8000/api/update-worker-picture', formData, { headers }).subscribe(
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

        this.http.put(`http://localhost:8000/api/update-profile`, updatedWorkerData, { headers })
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
    const postUrl = 'http://localhost:8000/api/postWorker';
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
}
