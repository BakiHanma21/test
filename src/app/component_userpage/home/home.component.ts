import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { API_URL } from '../../services/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface Work {
  title: string;
}

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('cardHover', [
      state('default', style({
        transform: 'translateY(0) scale(1)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
      })),
      state('hovered', style({
        transform: 'translateY(-12px) scale(1.02)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)'
      })),
      transition('default => hovered', [
        animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ]),
      transition('hovered => default', [
        animate('0.2s ease-out')
      ])
    ])
  ]
})
export class HomeComponent {
  isModalOpen = false;
  selectedWorker: any = null;
  reviewText = '';
  reviewRating = 0;
  stars = [1, 2, 3, 4, 5];
  workers: any[] = [];
  reviews: any[] = [];
  searchText = '';
  availabilityFilter: string = '';
  cardState: {[key: number]: string} = {};
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  // Image viewing properties
  isImageViewerOpen = false;
  selectedImage: string | null = null;
  selectedImageCaption: string = '';

  constructor(private router: Router, private favoriteService: FavoriteService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.redirectBasedOnRole();
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`${API_URL}/skilled_workers`, { headers })
        .subscribe(
          (response: any) => {
            console.log('Response data:', response.data);
            this.workers = this.shuffleArray(response.data || []);
            // Initialize card states
            this.workers.forEach(worker => {
              this.cardState[worker.id] = 'default';
            });
            this.calculateTotalPages();
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
  
  // Functions to handle card hover state
  setCardState(workerId: number, state: string): void {
    this.cardState[workerId] = state;
  }

  getCardState(workerId: number): string {
    return this.cardState[workerId] || 'default';
  }
  
  redirectBasedOnRole() {
    const role = localStorage.getItem('userRole');
    if (role === 'WORKER') {
      this.router.navigate(['/profile']);
    } else if (role === 'ADMINISTRATOR') {
      this.router.navigate(['/dashboard-management']);
    }
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Get filtered workers based on search and filter
  getFilteredWorkers() {
    return this.workers.filter(worker => {
      const matchesSearch = this.searchText ? 
        worker.name.toLowerCase().includes(this.searchText.toLowerCase()) || 
        worker.job.toLowerCase().includes(this.searchText.toLowerCase()) || 
        worker.location.toLowerCase().includes(this.searchText.toLowerCase()) 
        : true;
  
      const matchesAvailability = this.availabilityFilter !== '' ?
        worker.availability === Number(this.availabilityFilter)
        : true;
  
      return matchesSearch && matchesAvailability;
    });
  }

  // Get paginated workers for current page
  filteredWorkers() {
    const filtered = this.getFilteredWorkers();
    this.calculateTotalPages(filtered);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, filtered.length);
    
    return filtered.slice(startIndex, endIndex);
  }

  // Calculate total pages based on filtered workers
  calculateTotalPages(filteredWorkers?: any[]) {
    const workers = filteredWorkers || this.getFilteredWorkers();
    this.totalPages = Math.max(1, Math.ceil(workers.length / this.itemsPerPage));
    
    // Adjust current page if necessary
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  // Pagination navigation methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Generate array of page numbers for pagination
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  openModal(worker: any) {
    this.selectedWorker = worker;
    this.isModalOpen = true;
    console.log(this.selectedWorker.reviews.length);
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedWorker = null;
  }

  // Image viewer methods
  openImageViewer(imageSrc: string, caption: string = '') {
    this.selectedImage = imageSrc;
    this.selectedImageCaption = caption;
    this.isImageViewerOpen = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeImageViewer() {
    this.isImageViewerOpen = false;
    this.selectedImage = null;
    this.selectedImageCaption = '';
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  }

  setRating(rating: number) {
    this.reviewRating = rating;
  }

  submitReview(worker: any) {
    if (this.reviewRating === 0) {
      alert('Please select a rating before submitting your review.');
      return;
    }
    console.log(worker);
    const authToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);

    const reviewData = {
      worker_id: worker.id,
      name: worker.name,
      rating: this.reviewRating,
      text: this.reviewText
    };
    console.log('reviewData data:', reviewData);

    this.http.post(`${API_URL}/add-reviews`, reviewData, { headers }).subscribe(
      (response: any) => {
        alert('Review submitted successfully!');
        this.loadWorkers();
        this.closeModal();
      },
      (error) => {
        alert('Failed to submit the review. Please try again.');
      }
    );
  }

  bookWorker(worker: any) {
    this.selectedWorker = worker;
    this.router.navigate(['/book'], {
      queryParams: { id: worker.id, name: worker.name, job: worker.job }
    });
  }

  saveAsFavorite(worker: any) {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
  
    const favoriteData = {
      worker_id: worker.id,
      user_id: userId 
    };
  
    this.http.post(`${API_URL}/add-favorites`, favoriteData, { headers })
      .subscribe(
        (response: any) => {
          alert('Worker saved as favorite!');
          this.router.navigate(['/favorites']);
        },
        (error) => {
          alert('Failed to save worker as favorite. Please try again.');
        }
      );
  }
}
