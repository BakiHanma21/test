import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { Request } from './services/request.model';
import { RequestService } from './services/request.service';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatService } from './services/chat.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatListModule,
    MatBadgeModule,
    MatDialogModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  title = 'skilled-worker-app';
  unseenRequests: Request[] = [];
  unseenRequestsCount = 0;
  isSidenavOpen = true;
  notificationCount = 5;
  showSidenav = false;
  showSkilledWorkerSidenav = false;

  constructor(
    private requestService: RequestService,
    private router: Router,
    private dialog: MatDialog,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.checkUserType();
    this.router.events.subscribe(() => this.toggleSidenavForRoute());
    this.loadUnseenRequests();
    this.initializeChat();
  }

  ngAfterViewInit(): void {}

  checkUserType(): void {
    const userRole = this.getUserRole();
    switch (userRole) {
      case 'ADMINISTRATOR':
        this.showSidenav = false;
        this.showSkilledWorkerSidenav = false;
        break;
      case 'WORKER':
        this.showSidenav = false;
        this.showSkilledWorkerSidenav = true;
        break;
      case 'USER':
        this.showSidenav = true;
        this.showSkilledWorkerSidenav = false;
        break;
      default:
        this.showSidenav = false;
        this.showSkilledWorkerSidenav = false;
        break;
    }
  }

  getUserRole(): string {
    const role = localStorage.getItem('userRole');
    return role ? role : 'default';
  }

  toggleSidenavForRoute(): void {
    const excludedRoutes = [
      '/login',
      '/choices',
      '/skilled-registration',
      '/forgot-password',
      '/admin-login',
      '/dashboard-management',
      '/role-based-access-control',
      '/admin-registration',
      '/admin-forgot-password',
      '/reported-area',
      '/user-verification',
    ];
    const currentRoute = this.router.url;
    if (excludedRoutes.includes(currentRoute)) {
      this.showSidenav = false;
      this.showSkilledWorkerSidenav = false;
    } else {
      this.checkUserType();
    }
  }

  toggleDrawer(): void {
    if (this.sidenav) this.sidenav.toggle();
  }

  loadUnseenRequests(): void {
    this.requestService.getUnseenRequests().subscribe((requests: Request[]) => {
      this.unseenRequests = requests;
      this.unseenRequestsCount = requests.length;
    });
  }

  viewRequest(request: Request): void {
    this.requestService.markRequestAsSeen(request.id).subscribe(() => {
      this.unseenRequests = this.unseenRequests.filter((r) => r.id !== request.id);
      this.unseenRequestsCount = this.unseenRequests.length;
    });
  }

  markAllAsSeen(): void {
    this.unseenRequestsCount = 0;
    this.unseenRequests = [];
  }

  logout(): void {
    this.chatService.disconnectWebSocket();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }

  openEditProfileDialog(): void {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '500px',
      data: {
        name: 'User Name',
        email: 'user@example.com',
        location: 'User Location',
        profileImage: 'assets/user-login.jpg',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Updated profile:', result);
      }
    });
  }

  private initializeChat(): void {
    const userId = localStorage.getItem('user_id');
    const authToken = localStorage.getItem('authToken');
    if (userId && authToken) {
      this.chatService.initializeWebSocket();
      this.chatService.onNewMessage((chat) => {
        console.log('New message received in app.component:', chat);
      });
    }
  }
}