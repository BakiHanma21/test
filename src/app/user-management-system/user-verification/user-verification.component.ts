import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { API_URL } from '../../services/auth.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  availability: number;
  purok?: string;
  street?: string;
  location?: string;
  contactNumber?: string;
  phone?: string;
  skills?: string;
  experience?: number;
  image?: string;
  valid_id?: string;
  created_at?: string;
  status: string;
  work_examples?: WorkExample[];
}

interface WorkExample {
  title: string;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-user-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.css']
})
export class UserVerificationComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  sidebarOpen = true;
  isIconOnly = false;
  isMobileView = false;
  isProfileModalVisible: boolean = false;
  currentUser: any = {};
  selectedFilter: string = 'all';
  searchTerm = '';
  isApproveFormVisible = false;
  isDenyFormVisible = false;
  isCommentFormVisible = false;
  commentText: string = '';
  isCardView = false;
  
  // Image viewer properties
  isImageViewerVisible = false;
  currentViewedImage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.initializeChat();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth < 768;
    if (this.isMobileView) {
      this.sidebarOpen = false;
      this.isIconOnly = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen && this.isMobileView) {
      this.isIconOnly = false;
    }
  }

  toggleSidebarView() {
    if (this.sidebarOpen) {
      this.isIconOnly = !this.isIconOnly;
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const transitionEndHandler = () => {
          window.dispatchEvent(new Event('resize'));
          sidebar.removeEventListener('transitionend', transitionEndHandler);
        };
        sidebar.addEventListener('transitionend', transitionEndHandler);
      }
    }
  }

  loadUsers(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<User[]>(`${API_URL}/show-verification`, { headers })
        .subscribe(
          (response: User[]) => {
            this.users = response || [];
            this.filteredUsers = this.users;
            
            this.filteredUsers = this.filteredUsers.map(user => ({
              ...user,
              contactNumber: user.phone
            }));
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            }
            console.error('Error loading users:', error);
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  }

  filterUsers() {
    if (this.selectedFilter === 'all') {
      this.filteredUsers = this.users;
    } else if (this.selectedFilter === 'regular') {
      this.filteredUsers = this.users.filter(user => user.role.toLowerCase() === 'user');
    } else if (this.selectedFilter === 'skilled') {
      this.filteredUsers = this.users.filter(user => user.role.toLowerCase() === 'worker');
    }
  }

  viewProfile(user: User) {
    this.currentUser = {
      ...user,
      image: user.image,
      valid_id: user.valid_id,
      work_examples: user.work_examples || []
    };
    this.isProfileModalVisible = true;
  }

  closeProfileModal() {
    this.isProfileModalVisible = false;
  }

  searchUser() {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  approveUser(user: User) {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      
      this.http.put(`${API_URL}/update-verification/${user.id}`, { 
        status: 'Approved',
        sendEmail: true,
        emailType: 'approval'
      }, { headers })
        .subscribe(
          (response: any) => {
            console.log('User Approved Response:', response);
            alert('User approved and email notification sent.');
            this.loadUsers();
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            }
            console.error('Error approving user:', error);
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  
    this.closeForms();
  }

  denyUser(user: User) {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      
      this.http.delete(`${API_URL}/delete-verification/${user.id}`, { 
        headers,
        body: { 
          sendEmail: true,
          emailType: 'denial'
        }
      })
        .subscribe(
          (response: any) => {
            console.log('Delete Response:', response);
            alert('User denied and email notification sent.');
            this.loadUsers();
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            }
            console.error('Error denying user:', error);
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  
    this.closeForms();
  }

  openApproveForm(user: User) {
    this.currentUser = user;
    this.isApproveFormVisible = true;
  }

  openDenyForm(user: User) {
    this.currentUser = user;
    this.isDenyFormVisible = true;
  }

  openCommentForm(user: User) {
    this.currentUser = user;
    this.isCommentFormVisible = true;
  }

  closeForms() {
    this.isApproveFormVisible = false;
    this.isDenyFormVisible = false;
    this.isCommentFormVisible = false;
  }

  submitComment(user: User) {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      
      this.http.post(`${API_URL}/send-comment/${user.id}`, { 
        comment: this.commentText
      }, { headers })
        .subscribe(
          (response: any) => {
            console.log('Comment sent:', response);
            alert('Comment sent to user\'s email.');
            this.commentText = '';
          },
          (error) => {
            console.error('Error sending comment:', error);
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
    
    this.closeForms();
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

  // Image Viewer Methods
  openImageViewer(imageUrl: string): void {
    this.currentViewedImage = imageUrl;
    this.isImageViewerVisible = true;
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeImageViewer(): void {
    this.isImageViewerVisible = false;
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = '';
  }

  // Add keyboard event listener for the image viewer
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isImageViewerVisible) {
      this.closeImageViewer();
    }
  }
}