import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { API_URL } from '../../services/auth.service';

interface ProfileData {
  username: string;
  email: string;
  role: string;
  image: string;
  lastLogin?: string;
  accountCreated?: string;
  language: string;
}

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgClass, NgIf, NgStyle],
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.css']
})
export class ProfileManagementComponent implements OnInit {
  sidebarOpen: boolean = true;
  sidebarAnimating = false;
  isIconOnly = false;
  isMobileView = false;
  isEditFormVisible = false;
  isLoading = false;
  showSuccessToast = false;
  defaultProfileImage: string = 'assets/default-profile.png';
  
  profile: ProfileData = {
    username: '',
    email: '',
    role: '',
    image: '',
    lastLogin: '',
    accountCreated: '',
    language: 'English'
  };

  editForm = {
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    role: '',
    language: 'English'
  };

  availableLanguages = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Filipino', label: 'Filipino' }
  ];

  showCurrentPassword = false;
  showNewPassword = false;

  // Window resize listener
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.initializeChat();
    this.checkScreenSize(); // Check screen size on init
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  // Check if screen is mobile size
  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
    
    // Auto close sidebar on mobile
    if (this.isMobileView && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
    
    // If returning to desktop, ensure sidebar is open if not in icon-only mode
    if (!this.isMobileView && !this.sidebarOpen && !this.isIconOnly) {
      this.sidebarOpen = true;
    }
  }

  toggleSidebar(): void {
    if (this.sidebarAnimating) return;
    
    this.sidebarAnimating = true;
    this.sidebarOpen = !this.sidebarOpen;
    
    // Add transition end listener
    const sidebar = document.querySelector('.sidebar');
    const onTransitionEnd = () => {
      this.sidebarAnimating = false;
      sidebar?.removeEventListener('transitionend', onTransitionEnd);
    };
    
    sidebar?.addEventListener('transitionend', onTransitionEnd);
  }

  toggleSidebarView(): void {
    if (this.sidebarAnimating) return;
    
    this.sidebarAnimating = true;
    this.isIconOnly = !this.isIconOnly;
    
    // Ensure sidebar is open when switching to icon-only view
    if (this.isIconOnly && !this.sidebarOpen) {
      this.sidebarOpen = true;
    }
    
    // Add transition end listener
    const sidebar = document.querySelector('.sidebar');
    const onTransitionEnd = () => {
      this.sidebarAnimating = false;
      sidebar?.removeEventListener('transitionend', onTransitionEnd);
    };
    
    sidebar?.addEventListener('transitionend', onTransitionEnd);
  }

  loadProfile(): void {
    this.isLoading = true;
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`${API_URL}/admin-profile`, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Profile Response:', response);
            this.profile = {
              ...response.data,
              lastLogin: response.data.last_login || 'Never',
              accountCreated: response.data.created_at || 'Unknown',
              language: response.data.language || 'English'
            };
            this.editForm = {
              username: this.profile.username,
              email: this.profile.email,
              currentPassword: '',
              newPassword: '',
              role: this.profile.role,
              language: this.profile.language
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
        username: this.profile.username,
        email: this.profile.email,
        currentPassword: '',
        newPassword: '',
        role: this.profile.role,
        language: this.profile.language
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
      username: this.editForm.username,
      email: this.editForm.email,
      password: this.editForm.newPassword,
      role: this.editForm.role,
      currentPassword: this.editForm.currentPassword,
      language: this.editForm.language
    };

    this.http.put(`${API_URL}/update-admin-profile`, formData, { headers })
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

  togglePasswordVisibility(field: 'current' | 'new'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    }
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
        this.http.post(`${API_URL}/update-admin-picture`, formData, { headers })
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

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}