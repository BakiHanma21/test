import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '../../services/auth.service';
interface Transaction {
  transaction_id: number;
  name: string;
  title: string;
  payment_date: string;
  payment_status: string;
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
export class WorkerTransactionComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  manualStatus: string | null = null;
  reviewText: string = '';
  reviewRating: number = 1;
  stars: boolean[] = [true, false, false, false, false];
  
  // Filter properties
  statusFilter: string = 'ALL';
  searchQuery: string = '';
  showFilters: boolean = false;
  
  // View mode
  isTableView: boolean = false;

  // Modal properties
  selectedTransaction: Transaction | null = null;
  showDetailsModal: boolean = false;

  // Image Modal properties
  isImageModalOpen: boolean = false;
  modalImageUrl: string | null = null;
  modalImageAlt: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<{ data: Transaction[] }>(`${API_URL}/transactions`, { headers })
        .subscribe(
          (response) => {
            this.transactions = response.data || [];
            // Ensure all amount values are treated as numbers
            this.transactions.forEach(transaction => {
              if (typeof transaction.amount !== 'number') {
                transaction.amount = parseFloat(transaction.amount as any) || 0;
              }
            });
            this.filteredTransactions = [...this.transactions];
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

  // Modal controls
  openDetailsModal(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showDetailsModal = true;
    // Prevent scrolling on the background
    document.body.style.overflow = 'hidden';
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedTransaction = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }

  // Utility method to format amount with decimal places
  formatAmount(amount: any): string {
    if (amount === undefined || amount === null) return '0.00';
    
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(numAmount)) return '0.00';
    
    return numAmount.toFixed(2);
  }

  onQrCodeSelected(event: Event, transactionId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('qr_code', file);

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post<{ message: string; qr_code_url: string }>(
          `${API_URL}/transactions/${transactionId}/upload-qr-code`,
          formData,
          { headers }
        ).subscribe(
          (response) => {
            alert(response.message);
            const transaction = this.transactions.find(t => t.transaction_id === transactionId);
            if (transaction) {
              transaction.qr_code_url = response.qr_code_url;
              console.log('Updated transaction with QR code:', transaction); // Debug
            }
          },
          (error) => {
            console.error('Error uploading QR code:', error);
            alert('Failed to upload QR code');
          }
        );
      }
    }
  }

  removeQrCode(transactionId: number): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.post<{ message: string }>(
        `${API_URL}/transactions/${transactionId}/remove-qr-code`,
        {},
        { headers }
      ).subscribe(
        (response) => {
          alert(response.message || 'QR code removed successfully');
          const transaction = this.transactions.find(t => t.transaction_id === transactionId);
          if (transaction) {
            transaction.qr_code_url = undefined;
            // Also update in filtered transactions
            const filteredTransaction = this.filteredTransactions.find(t => t.transaction_id === transactionId);
            if (filteredTransaction) {
              filteredTransaction.qr_code_url = undefined;
            }
          }
        },
        (error) => {
          console.error('Error removing QR code:', error);
          alert('Failed to remove QR code');
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  getPaymentStatus(status: string | undefined): string {
    if (!status) return 'Unknown Status';
    switch (status.toUpperCase()) {
      case 'PENDING': return 'NOT YET PAID';
      case 'PAID': return 'PAID';
      case 'MANUALLY UPDATED': return 'PAID';
      case 'FAILED': return 'FAILED';
      default: return 'Unknown Status';
    }
  }

  toggleView(): void {
    this.isTableView = !this.isTableView;
  }

  markAsPaidManually(transactionId: number): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.post<{ message: string; transaction: Transaction }>(
        `${API_URL}/transactions/${transactionId}/mark-as-paid`,
        {},
        { headers }
      ).subscribe(
        (response) => {
          alert(response.message);
          const transaction = this.transactions.find(t => t.transaction_id === transactionId);
          if (transaction) {
            transaction.payment_status = 'MANUALLY UPDATED';
          }
          this.loadTransactions();
        },
        (error) => {
          console.error('Error updating payment status:', error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  submitReview(transactionId: number): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.post<{ message: string }>(
        `${API_URL}/transactions/${transactionId}/submit-review`,
        { review: this.reviewText, rating: this.reviewRating },
        { headers }
      ).subscribe(
        (response) => {
          alert(response.message);
          const transaction = this.transactions.find(t => t.transaction_id === transactionId);
          if (transaction) {
            transaction.review = this.reviewText;
            transaction.rating = this.reviewRating;
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
      originalSrc: imgElement.getAttribute('data-original-src')
    });
    
    // Try to fix the path if it's missing 'storage/' prefix
    if (imgElement.src && !imgElement.src.includes('/storage/') && 
        (imgElement.src.includes('/images/') || imgElement.src.includes('/qr_codes/'))) {
      // Save original source for debugging
      imgElement.setAttribute('data-original-src', imgElement.src);
      
      // Try to fix the path by adding storage prefix
      const pathParts = imgElement.src.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folderName = pathParts[pathParts.length - 2];
      
      // Set a fallback image or attempt path correction
      if (folderName === 'images' || folderName === 'qr_codes') {
        const correctedPath = `${API_URL}storage/${folderName}/${fileName}`;
        console.log('Attempting to fix image path:', correctedPath);
        imgElement.src = correctedPath;
      } else {
        // Set fallback image
        imgElement.src = folderName === 'qr_codes' ? 
          'assets/placeholder-qr.png' : 'assets/placeholder-image.png';
      }
    } else {
      // Set a fallback image if correction attempt is not possible
      imgElement.src = imgElement.alt.includes('QR') ? 
        'assets/placeholder-qr.png' : 'assets/placeholder-image.png';
    }
  }

  // Filter functions
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
    // Show a toast message
    this.manualStatus = `Filtered by: ${status === 'ALL' ? 'All Status' : status === 'PAID' ? 'Paid' : status === 'PENDING' ? 'Not Yet Paid' : 'Failed'}`;
    setTimeout(() => {
      this.manualStatus = null;
    }, 2000);
  }

  applySearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      // First filter by status
      if (this.statusFilter !== 'ALL') {
        // Special case for PAID status, which includes MANUALLY UPDATED
        if (this.statusFilter === 'PAID') {
          if (transaction.payment_status.toUpperCase() !== 'PAID' && transaction.payment_status.toUpperCase() !== 'MANUALLY UPDATED') {
            return false;
          }
        } else if (transaction.payment_status.toUpperCase() !== this.statusFilter) {
          return false;
        }
      }
      
      // Then filter by search query
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase().trim();
        return (
          transaction.name.toLowerCase().includes(query) || 
          transaction.title?.toLowerCase().includes(query) ||
          transaction.description?.toLowerCase().includes(query) ||
          transaction.transaction_id.toString().includes(query)
        );
      }
      
      return true;
    });
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.searchQuery = '';
    this.filteredTransactions = [...this.transactions];
    this.manualStatus = "Filters cleared";
    setTimeout(() => {
      this.manualStatus = null;
    }, 2000);
  }

  // Helper function to determine if a transaction has a review from the worker
  hasWorkerReview(transaction: Transaction): boolean {
    return transaction.review !== null && transaction.review !== undefined;
  }

  // Helper function to determine if a transaction has a review from the customer
  hasCustomerReview(transaction: Transaction): boolean {
    return transaction.review2 !== null && transaction.review2 !== undefined;
  }

  // Open image modal to view receipt
  openReceiptModal(receiptUrl: string): void {
    this.modalImageUrl = receiptUrl;
    this.modalImageAlt = 'Payment Receipt';
    this.isImageModalOpen = true;
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
  }

  // Close image modal
  closeImageModal(): void {
    this.isImageModalOpen = false;
    this.modalImageUrl = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
}