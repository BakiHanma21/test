import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';  
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

interface User {
  id: number;
  name: string;
  dateCreated: string;
  role: string;
  availability: number;
  report_reason: string;
  created_at: string;
}

interface Worker {
  id: number;
  name: string;
  dateCreated: string;
  skills: string;
  availability: number;
  report_reason: string;
  created_at: string;
}

@Component({
  selector: 'app-role-based-access-control',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './role-based-access-control.component.html',
  styleUrl: './role-based-access-control.component.css'
})
export class RoleBasedAccessControlComponent {
  users: User[] = [];
  workers: Worker[] = [];
  sidebarOpen = true;
  filteredUsers = this.users;
  filteredWorkers = this.workers;
  userSearchTerm = '';
  workerSearchTerm = '';

  isDeleteUserModalOpen = false;
  isDeleteWorkerModalOpen = false;
  isUserModalOpen = false;
  isWorkerModalOpen = false;
  selectedUser: any = null;
  selectedWorker: any = null;
  disableUserReason: string | null = null;
  disableWorkerReason: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.loadusers();
    this.initializeChat();
  }

  loadusers(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get('http://localhost:8000/api/show-users', { headers })
        .subscribe(
          (response: any) => {
            console.log('Profile Response:', response);
            this.users = response.users || []; 
            this.workers = response.workers || [];
            this.filteredUsers = this.users;
            this.filteredWorkers = this.workers;
            console.log('Workers:', this.workers);
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

  searchUsers() {
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );
  }

  searchWorkers() {
    this.filteredWorkers = this.workers.filter(worker => 
      worker.name.toLowerCase().includes(this.workerSearchTerm.toLowerCase()) ||
      worker.skills.toLowerCase().includes(this.workerSearchTerm.toLowerCase())
    );
  }

  openDeleteUserModal(userId: number) {
    this.selectedUser = this.users.find(user => user.id === userId);
    this.isDeleteUserModalOpen = true;
  }

  openDeleteWorkerModal(workerId: number) {
    this.selectedWorker = this.workers.find(worker => worker.id === workerId);
    this.isDeleteWorkerModalOpen = true;
  }

  closeDeleteUserModal() {
    this.isDeleteUserModalOpen = false;
    this.selectedUser = null;
    this.disableUserReason = null;
  }

  closeDeleteWorkerModal() {
    this.isDeleteWorkerModalOpen = false;
    this.selectedWorker = null;
    this.disableWorkerReason = null;
  }

  confirmDeleteUser() {
    if (this.selectedUser) {
      this.users = this.users.filter(user => user.id !== this.selectedUser.id);

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        const body = {
          reason: this.disableUserReason
        };
        this.http.delete(`http://localhost:8000/api/delete-user/${this.selectedUser.id}`, { headers, body })
          .subscribe(
            (response: any) => {
              console.log('User Deleted Response:', response);
              this.users = response.users || []; 
              this.workers = response.workers || [];
              this.filteredUsers = this.users;
              this.filteredWorkers = this.workers;
            },
            (error) => {
              if (error.status === 401) {
                alert('Unauthorized! Please log in again.');
                this.router.navigate(['/login']);
              }
              console.error('Error deleting user:', error);
            }
          );
      } else {
        this.router.navigate(['/login']);
      }
      console.log('User deleted:', this.selectedUser.id);
      this.closeDeleteUserModal();
    }
  }

  confirmDeleteWorker() {
    if (this.selectedWorker) {
      this.workers = this.workers.filter(worker => worker.id !== this.selectedWorker.id);
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        const body = {
          reason: this.disableWorkerReason
        };
        this.http.delete(`http://localhost:8000/api/delete-user/${this.selectedWorker.id}`, { headers, body })
          .subscribe(
            (response: any) => {
              console.log('Worker Deleted Response:', response);
              this.users = response.users || []; 
              this.workers = response.workers || [];
              this.filteredUsers = this.users;
              this.filteredWorkers = this.workers;
            },
            (error) => {
              if (error.status === 401) {
                alert('Unauthorized! Please log in again.');
                this.router.navigate(['/login']);
              }
              console.error('Error deleting user:', error);
            }
          );
      } else {
        this.router.navigate(['/login']);
      }
      console.log('Worker deleted:', this.selectedWorker.id);
      this.closeDeleteWorkerModal();
    }
  }

  editUser(user: any) {
    this.selectedUser = { ...user };
    this.isUserModalOpen = true;
  }

  saveUser() {
    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index !== -1) {
      this.users[index] = { ...this.selectedUser };
    }
    this.closeUserModal();
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }

  editWorker(worker: any) {
    this.selectedWorker = { ...worker };
    this.isWorkerModalOpen = true;
  }

  saveWorker() {
    const index = this.workers.findIndex(w => w.id === this.selectedWorker.id);
    if (index !== -1) {
      this.workers[index] = { ...this.selectedWorker };
    }
    this.closeWorkerModal();
  }

  closeWorkerModal() {
    this.isWorkerModalOpen = false;
  }

  hasAccess(requiredRole: string): boolean {
    const currentRole = this.authService.getUserRole();
    return currentRole === requiredRole;
  }

  deleteUser(userId: number) {
    console.log('Delete user triggered', userId);
    this.selectedUser = this.users.find(user => user.id === userId);
    this.isDeleteUserModalOpen = true;
  }

  deleteWorker(workerId: number) {
    console.log('Delete worker triggered', workerId);
    this.selectedWorker = this.workers.find(worker => worker.id === workerId);
    this.isDeleteWorkerModalOpen = true;
  }

  toggleSidebar(): void {
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