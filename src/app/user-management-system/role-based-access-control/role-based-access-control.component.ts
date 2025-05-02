import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';  
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { API_URL } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgStyle, NgIf } from '@angular/common';

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

export interface VerificationConfig {
  smsVerificationRequired: boolean;
  emailVerificationRequired: boolean;
  googleAuthenticatorRequired: boolean;
  deviceVerificationRequired: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  verificationConfig: VerificationConfig;
}

@Component({
  selector: 'app-role-based-access-control',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './role-based-access-control.component.html',
  styleUrl: './role-based-access-control.component.css',
  standalone: true
})
export class RoleBasedAccessControlComponent implements OnInit {
  addRoleForm!: FormGroup;
  editRoleForm!: FormGroup;
  roles: Role[] = [];
  permissions: string[] = [
    'read_user_data',
    'write_user_data',
    'read_admin_data',
    'write_admin_data',
    'approve_verifications',
    'manage_users',
    'manage_roles',
    'view_analytics',
    'manage_system_settings'
  ];
  showAddRoleForm = false;
  showEditRoleForm = false;
  editingRole: Role | null = null;
  isLoading = false;
  sidebarOpen = true;
  isIconOnly = false;
  isMobileView = false;
  users: User[] = [];
  workers: Worker[] = [];
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
    private chatService: ChatService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadRoles();
    this.checkScreenSize();
    this.loadusers();
    this.initializeChat();
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
      // If opening sidebar on mobile, make sure it's not in icon-only mode
      this.isIconOnly = false;
    }
  }

  toggleSidebarView() {
    if (this.sidebarOpen) {
      this.isIconOnly = !this.isIconOnly;
      // Add event listener for transition end to properly handle animations
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

  loadusers(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`${API_URL}/show-users`, { headers })
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
        this.http.delete(`${API_URL}/delete-user/${this.selectedUser.id}`, { headers, body })
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
        this.http.delete(`${API_URL}/delete-user/${this.selectedWorker.id}`, { headers, body })
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

  initForms() {
    this.addRoleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: [[], Validators.required],
      smsVerificationRequired: [false],
      emailVerificationRequired: [false],
      googleAuthenticatorRequired: [false],
      deviceVerificationRequired: [false]
    });

    this.editRoleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: [[], Validators.required],
      smsVerificationRequired: [false],
      emailVerificationRequired: [false],
      googleAuthenticatorRequired: [false],
      deviceVerificationRequired: [false]
    });
  }

  loadRoles() {
    this.isLoading = true;
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<Role[]>(`${API_URL}/roles`, { headers })
        .subscribe(
          (data) => {
            this.roles = data;
            this.isLoading = false;
          },
          (error) => {
            console.error('Error loading roles:', error);
            this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
            this.isLoading = false;
            if (error.status === 401) {
              this.router.navigate(['/login']);
            }
          }
        );
    } else {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }
  }
}