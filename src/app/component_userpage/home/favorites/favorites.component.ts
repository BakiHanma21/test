import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
  standalone: true,
  selector: 'app-favorites',
  imports: [CommonModule,FormsModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  worker: any[] = [];
  favorites: any[] = [];
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`http://localhost:8000/api/favorites`, { headers })
        .subscribe(
          (response: any) => {
            console.log(response);
            this.favorites = response.data || [];
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

  unsaveAsFavorite(worker: any) {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
  
    const favoriteData = {
      worker_id: worker.id,
      user_id: userId
    };
  
    this.http.post(`http://localhost:8000/api/remove-favorites`, favoriteData, { headers })
      .subscribe(
        (response: any) => {
          alert('Worker removed from favorites!');
          this.loadFavorites(); // Refresh favorites list
        },
        (error) => {
          alert('Failed to remove worker from favorites. Please try again.');
        }
      );
  }
  
}
