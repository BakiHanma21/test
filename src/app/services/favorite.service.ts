import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private favoritesList: any[] = [];

  addFavorite(worker: any) {
    const exists = this.favoritesList.some(
      (fav) =>
        fav.name === worker.name &&
        fav.job === worker.job &&
        fav.location === worker.location &&
        fav.experience === worker.experience &&
        fav.availability === worker.availability &&
        fav.rating === worker.rating &&
        fav.phone === worker.phone &&
        fav.email === worker.email &&
        fav.image === worker.image &&
        JSON.stringify(fav.reviews) === JSON.stringify(worker.reviews) &&
        JSON.stringify(fav.works) === JSON.stringify(worker.works)
    );

    if (!exists) {
      this.favoritesList.push(worker);
    }
  }

  getFavorites() {
    return this.favoritesList;
  }
}