import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Request } from '../services/request.model';
import { RequestService } from '../services/request.service';
@Component({
  selector: 'app-skilled-worker-page',
  imports: [],
  templateUrl: './skilled-worker-page.component.html',
  styleUrl: './skilled-worker-page.component.css'
})
export class SkilledWorkerPageComponent {
  @ViewChild('drawer') drawer: MatSidenav | undefined;
  title = 'skilled-worker-app';
  unseenRequests: Request[] = [];
  unseenRequestsCount = 0;

  constructor(
    private requestService: RequestService,
    private router: Router
  ) {}

  ngOnInit(): void {

          this.loadUnseenRequests();
     
  }
  

  ngAfterViewInit(): void {
    if (this.drawer) {
      console.log('Drawer is available');
    } else {
      console.log('Drawer is undefined');
    }
  }

  loadUnseenRequests(): void {
    this.requestService.getUnseenRequests().subscribe((requests: Request[]) => {
      this.unseenRequests = requests;
      this.unseenRequestsCount = requests.length;
    });
  }

  viewRequest(request: Request): void {
    console.log('Viewing request:', request);
    this.requestService.markRequestAsSeen(request.id).subscribe(() => {
      this.unseenRequests = this.unseenRequests.filter((r) => r.id !== request.id);
      this.unseenRequestsCount = this.unseenRequests.length;
    });
  }

  markAllAsSeen(): void {
    console.log('Marking all as seen...');
    this.unseenRequestsCount = 0;
    this.unseenRequests = [];
  }

  toggleDrawer(): void {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  // Logout method
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }
  
}
