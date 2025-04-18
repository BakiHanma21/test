import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';

interface Work {
  title: string;
}

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
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

  constructor(private router: Router, private favoriteService: FavoriteService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  loadWorkers(): void {
    this.redirectBasedOnRole();
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`http://localhost:8000/api/skilled_workers`, { headers })
        .subscribe(
          (response: any) => {
            console.log('Response data:', response.data);
            this.workers = this.shuffleArray(response.data || []);
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

  filteredWorkers() {
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

  openModal(worker: any) {
    this.selectedWorker = worker;
    this.isModalOpen = true;
    console.log(this.selectedWorker.reviews.length);
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedWorker = null;
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

    this.http.post(`http://localhost:8000/api/add-reviews`, reviewData, { headers }).subscribe(
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
  
    this.http.post(`http://localhost:8000/api/add-favorites`, favoriteData, { headers })
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
