import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

interface ProfileData {
  username: string;
  password: string;
  email: string;
  role: string;
  image: string;
  lastLogin?: string;
  accountCreated?: string;
  twoFactorEnabled: boolean;
}

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgClass],
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.css']
})
export class ProfileManagementComponent implements OnInit {
  sidebarOpen: boolean = true;
  passwordVisible = false;
  isEditFormVisible = false;
  isSaved = false;
  isLoading = false;
  showSuccessToast = false;
  defaultProfileImage: string = 'assets/default-profile.png';
  showPassword: boolean = false;
  
  profile: ProfileData = {
    username: '',
    password: '',
    email: '',
    role: '',
    image: '',
    lastLogin: '',
    accountCreated: '',
    twoFactorEnabled: false
  };

  editForm = {
    email: '',
    password: '',
    role: '',
    currentPassword: '',
    twoFactorEnabled: false
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loadProfile(): void {
    this.isLoading = true;
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get('http://localhost:8000/api/admin-profile', { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Profile Response:', response);
            this.profile = {
              ...response.data,
              lastLogin: response.data.last_login || 'Never',
              accountCreated: response.data.created_at || 'Unknown',
              twoFactorEnabled: Boolean(response.data.two_factor_enabled)
            };
            this.editForm = {
              email: this.profile.email,
              password: '',
              role: this.profile.role,
              currentPassword: '',
              twoFactorEnabled: this.profile.twoFactorEnabled
            };
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            }
            console.error('Error loading profile:', error);
          }
        });
    } else {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }
  }

  toggleEditForm() {
    this.isEditFormVisible = !this.isEditFormVisible;
    if (this.isEditFormVisible) {
      this.editForm = {
        email: this.profile.email,
        password: '',
        role: this.profile.role,
        currentPassword: '',
        twoFactorEnabled: this.profile.twoFactorEnabled
      };
    }
  }

  saveChanges() {
    if (!this.editForm.currentPassword) {
      alert('Please enter your current password to make changes.');
      return;
    }

    this.isLoading = true;
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    
    const formData = {
      email: this.editForm.email,
      password: this.editForm.password,
      role: this.editForm.role,
      currentPassword: this.editForm.currentPassword,
      twoFactorEnabled: this.editForm.twoFactorEnabled
    };

    this.http.put('http://localhost:8000/api/update-admin-profile', formData, { headers })
      .subscribe({
        next: (response) => {
          console.log('Profile updated:', response);
          this.isLoading = false;
          this.showSuccessToast = true;
          this.toggleEditForm();
          this.loadProfile();
          
          // Hide success toast after 3 seconds
          setTimeout(() => {
            this.showSuccessToast = false;
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating profile:', error);
          alert(error.error.message || 'Error updating profile. Please try again.');
        }
      });
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  openFileDialog() {
    document.getElementById('fileInput')?.click();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        alert('Please upload only PNG, JPEG, or JPG images.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should not exceed 5MB.');
        return;
      }

      this.isLoading = true;
      const formData = new FormData();
      formData.append('profile_picture', file);

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post('http://localhost:8000/api/update-admin-picture', formData, { headers })
          .subscribe({
            next: (response: any) => {
              console.log('Upload successful:', response);
              this.isLoading = false;
              this.showSuccessToast = true;
              this.loadProfile();
              
              setTimeout(() => {
                this.showSuccessToast = false;
              }, 3000);
            },
            error: (error) => {
              this.isLoading = false;
              if (error.status === 201) {
                this.showSuccessToast = true;
                this.loadProfile();
                setTimeout(() => {
                  this.showSuccessToast = false;
                }, 3000);
              } else {
                console.error('Error uploading profile picture:', error);
                alert(error.error.message || 'Error uploading profile picture. Please try again.');
              }
            }
          });
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
    const userId = localStorage.getItem('user_id');
    const authToken = localStorage.getItem('authToken');
    if (userId && authToken) {
      this.chatService.initializeWebSocket();
      this.chatService.onNewMessage((chat) => {
        console.log('New message received:', chat);
      });
    }
  }
}