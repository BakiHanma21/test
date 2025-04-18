import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Transaction {
  transaction_id: number;
  title: string;
  payment_status: string;
  payment_date: string;
  description: string;
  review: string | null;
  rating: number;
  review2: string | null;
  rating2: number;
  amount: number;
  qr_code_url?: string;
  receipt_url?: string;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  transactions: Transaction[] = [];
  reviewText: string = '';
  reviewRating: number = 1;
  stars: boolean[] = [true, false, false, false, false];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<{ data: Transaction[] }>('http://localhost:8000/api/transactions', { headers })
        .subscribe(
          (response) => {
            this.transactions = response.data || [];
            console.log('Loaded transactions:', this.transactions); // Debug
          },
          (error) => {
            if (error.status === 401) {
              alert('Unauthorized! Please log in again.');
              this.router.navigate(['/login']);
            } else {
              console.error('Error loading transactions:', error);
            }
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: Event, transactionId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('receipt', file);

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post<{ message: string; receipt_url: string }>(
          `http://localhost:8000/api/transactions/${transactionId}/upload-receipt`,
          formData,
          { headers }
        ).subscribe(
          (response) => {
            alert(response.message);
            const transaction = this.transactions.find(t => t.transaction_id === transactionId);
            if (transaction) {
              transaction.receipt_url = response.receipt_url;
              console.log('Updated transaction with receipt:', transaction); // Debug
            }
          },
          (error) => {
            console.error('Error uploading receipt:', error);
            alert('Failed to upload receipt');
          }
        );
      }
    }
  }

  submitReview(transactionId: number): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.post<{ message: string }>(
        `http://localhost:8000/api/transactions/${transactionId}/submit-review2`,
        { review: this.reviewText, rating: this.reviewRating },
        { headers }
      ).subscribe(
        (response) => {
          alert(response.message);
          const transaction = this.transactions.find(t => t.transaction_id === transactionId);
          if (transaction) {
            transaction.review2 = this.reviewText;
            transaction.rating2 = this.reviewRating;
          }
        },
        (error) => {
          console.error('Error submitting review:', error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  setRating(rating: number): void {
    this.reviewRating = rating;
    this.stars = this.stars.map((_, index) => index < rating);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error('Image failed to load:', {
      src: imgElement.src,
      alt: imgElement.alt,
      event: event
    });
  }
}