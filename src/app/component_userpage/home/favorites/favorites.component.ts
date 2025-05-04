import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
  standalone: true,
  selector: 'app-favorites',
  imports: [CommonModule, FormsModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  worker: any[] = [];
  favorites: any[] = [];
  isModalOpen = false;
  selectedWorker: any = null;
  isLoading = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`http://localhost:8000/api/favorites`, { headers })
        .subscribe(
          (response: any) => {
            console.log('Favorites loaded:', response);
            this.favorites = response.data || [];
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            console.error('Error loading favorites:', error);
            if (error.status === 401) {
              alert('Your session has expired. Please log in again.');
              this.router.navigate(['/login']);
            } else {
              alert('Failed to load favorites. Please try again later.');
            }
          }
        );
    } else {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }
  }

  unsaveAsFavorite(worker: any) {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    
    if (!authToken || !userId) {
      alert('You need to be logged in to perform this action.');
      this.router.navigate(['/login']);
      return;
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
  
    const favoriteData = {
      worker_id: worker.id,
      user_id: userId
    };
  
    this.http.post(`http://localhost:8000/api/remove-favorites`, favoriteData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Worker removed from favorites:', response);
          this.loadFavorites(); // Refresh favorites list
        },
        (error) => {
          console.error('Error removing from favorites:', error);
          alert('Failed to remove from favorites. Please try again.');
        }
      );
  }

  openModal(worker: any) {
    this.selectedWorker = worker;
    this.isModalOpen = true;
    // Prevent scrolling of the background
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedWorker = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
  
  bookWorker(worker: any) {
    // Navigate to booking page with query parameters
    this.router.navigate(['/book'], {
      queryParams: {
        id: worker.id,
        name: worker.name,
        job: worker.job_title || worker.job
      }
    });
  }
}
