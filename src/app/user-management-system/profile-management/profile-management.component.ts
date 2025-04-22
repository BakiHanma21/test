import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-profile-management',
  imports: [CommonModule, FormsModule, RouterModule, NgClass],
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.css']
})
export class ProfileManagementComponent {
  sidebarOpen: boolean = true;
  passwordVisible = false; 
  isEditFormVisible = false;
  isSaved = false;
  defaultProfileImage: string = 'images/image.png';

  profile = {
    username: '',
    password: '',
    email: '',
    role: '',
    image: ''
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.initializeChat();
  }

  loadProfile(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get('http://localhost:8000/api/admin-profile', { headers })
        .subscribe(
          (response: any) => {
            console.log('Profile Response:', response);
            this.profile = response.data || [];
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            }
            console.error('Error loading profile:', error);
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleEditForm() {
    this.isEditFormVisible = !this.isEditFormVisible;
  }

  saveChanges() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    
    const formData = {
      email: this.profile.email,
      password: this.profile.password,
      role: this.profile.role
    };

    this.http.put('http://localhost:8000/api/update-admin-profile', formData, { headers })
      .subscribe(
        (response) => {
          console.log('Profile updated:', response);
          this.isSaved = true;
          this.toggleEditForm();
        },
        (error) => {
          console.error('Error updating profile:', error);
        }
      );
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  openFileDialog() {
    document.getElementById('fileInput')?.click();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const formData = new FormData();
      
      const userId = localStorage.getItem('user_id'); // Changed from 'userId' to 'user_id'
      formData.append('profile_picture', file);

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post('http://localhost:8000/api/update-admin-picture', formData, { headers }).subscribe(
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

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSidebarInside() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.chatService.disconnectWebSocket();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }

  private initializeChat(): void {
    const userId = localStorage.getItem('user_id'); // Changed from 'userId' to 'user_id'
    const authToken = localStorage.getItem('authToken');
    if (userId && authToken) {
      this.chatService.initializeWebSocket();
      this.chatService.onNewMessage((chat) => {
        console.log('New message received:', chat);
      });
    }
  }
}