import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '../../services/auth.service';

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
  selectedFile?: File;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  previewUrl?: string;
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
  filteredTransactions: Transaction[] = [];
  reviewText: string = '';
  reviewRating: number = 1;
  stars: boolean[] = [true, false, false, false, false];
  selectedPaymentMethod: { [key: string]: string } = {};
  activeFilter: string = 'ALL';
  isLoading: boolean = false;
  error: string | null = null;

  // Add table view toggle
  isTableView: boolean = false;
  statusToast: string | null = null;

  // Add property to track transaction being reviewed
  selectedTransaction: Transaction | null = null;

  // Image Modal properties
  isImageModalOpen: boolean = false;
  modalImageUrl: string | null = null;
  modalImageTitle: string = '';
  modalImageType: 'receipt' | 'qrcode' = 'receipt';

  // Transaction Details Modal properties
  isDetailsModalOpen: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTransactions();
    
    // Check for user preference for table view in local storage
    const savedViewMode = localStorage.getItem('transactionViewMode');
    if (savedViewMode) {
      this.isTableView = savedViewMode === 'table';
    }
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.error = null;
    
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<{ data: Transaction[] }>(`${API_URL}/transactions`, { headers })
        .subscribe(
          (response) => {
            this.transactions = response.data || [];
            // Process transactions to format amounts
            this.transactions.forEach(transaction => {
              // Ensure amount is a number
              if (typeof transaction.amount === 'string') {
                transaction.amount = parseFloat(transaction.amount);
              }
            });
            
            this.applyFilter(this.activeFilter); // Apply initial filter
            console.log('Loaded transactions:', this.transactions);
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            if (error.status === 401) {
              this.error = 'Your session has expired. Please log in again.';
              alert(this.error);
              this.router.navigate(['/login']);
            } else {
              this.error = 'Failed to load transactions. Please try again later.';
              console.error('Error loading transactions:', error);
            }
          }
        );
    } else {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }
  }

  // Set active filter and apply it
  setFilter(status: string): void {
    this.activeFilter = status;
    this.applyFilter(status);
    
    // Show status toast
    let filterName = status === 'ALL' ? 'All Transactions' : status;
    this.statusToast = `Filtered by: ${filterName}`;
    setTimeout(() => {
      this.statusToast = null;
    }, 2000);
  }

  // Apply filter to transactions
  applyFilter(status: string): void {
    if (status === 'ALL') {
      this.filteredTransactions = [...this.transactions];
    } else if (status === 'PAID') {
      // Combine PAID and MANUALLY UPDATED
      this.filteredTransactions = this.transactions.filter(
        transaction => transaction.payment_status === 'PAID' || transaction.payment_status === 'MANUALLY UPDATED'
      );
    } else {
      this.filteredTransactions = this.transactions.filter(
        transaction => transaction.payment_status === status
      );
    }
  }

  // Helper method to get display status
  getPaymentStatus(status: string): string {
    if (!status) return 'Unknown';
    
    switch(status.toUpperCase()) {
      case 'PENDING': return 'PENDING';
      case 'PAID': return 'PAID';
      case 'MANUALLY UPDATED': return 'PAID'; // Display MANUALLY UPDATED as PAID
      default: return status;
    }
  }

  // Toggle view mode
  toggleView(): void {
    this.isTableView = !this.isTableView;
    // Save preference to local storage
    localStorage.setItem('transactionViewMode', this.isTableView ? 'table' : 'card');
  }

  // View transaction details from table (updated method)
  viewTransactionDetails(transaction: Transaction): void {
    // Set the selected transaction and open the modal
    this.selectedTransaction = transaction;
    this.isDetailsModalOpen = true;
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
  }
  
  // Close transaction details modal
  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedTransaction = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }

  onFileSelected(event: Event, transactionId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('receipt', file);

      this.isLoading = true;
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post<{ message: string; receipt_url: string }>(
          `${API_URL}/transactions/${transactionId}/upload-receipt`,
          formData,
          { headers }
        ).subscribe(
          (response) => {
            this.isLoading = false;
            alert(response.message);
            const transaction = this.transactions.find(t => t.transaction_id === transactionId);
            if (transaction) {
              transaction.receipt_url = response.receipt_url;
              this.clearFileSelection(transaction);
              console.log('Updated transaction with receipt:', transaction);
            }
          },
          (error) => {
            this.isLoading = false;
            console.error('Error uploading receipt:', error);
            alert('Failed to upload receipt. Please try again.');
          }
        );
      } else {
        this.isLoading = false;
        alert('You need to be logged in to perform this action.');
        this.router.navigate(['/login']);
      }
    }
  }

  submitReview(transactionId: number): void {
    if (!this.reviewText.trim()) {
      alert('Please enter a review before submitting.');
      return;
    }
    
    this.isLoading = true;
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.post<{ message: string }>(
        `${API_URL}/transactions/${transactionId}/submit-review2`,
        { review: this.reviewText, rating: this.reviewRating },
        { headers }
      ).subscribe(
        (response) => {
          this.isLoading = false;
          alert(response.message);
          const transaction = this.transactions.find(t => t.transaction_id === transactionId);
          if (transaction) {
            transaction.review2 = this.reviewText;
            transaction.rating2 = this.reviewRating;
          }
          // Reset the review form
          this.reviewText = '';
          this.reviewRating = 1;
          this.stars = [true, false, false, false, false];
        },
        (error) => {
          this.isLoading = false;
          console.error('Error submitting review:', error);
          alert('Failed to submit review. Please try again.');
        }
      );
    } else {
      this.isLoading = false;
      alert('You need to be logged in to submit a review.');
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
    
    // Set default image or show error message
    imgElement.src = 'assets/images/qr-placeholder.png';
    imgElement.alt = 'QR Code Unavailable';
  }

  handleFileSelect(event: Event, transaction: Transaction): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 5MB limit. Please select a smaller file.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and PDF files are allowed.');
      return;
    }

    // Update transaction with file info
    transaction.selectedFile = file;
    transaction.fileName = file.name;
    transaction.fileSize = this.formatFileSize(file.size);
    transaction.fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

    // Create preview URL
    if (transaction.fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        transaction.previewUrl = e.target?.result?.toString() || undefined;
      };
      reader.readAsDataURL(file);
    } else {
      transaction.previewUrl = 'pdf-preview'; // Trigger PDF preview display
    }
  }

  clearFileSelection(transaction: Transaction): void {
    transaction.selectedFile = undefined;
    transaction.fileName = undefined;
    transaction.fileSize = undefined;
    transaction.fileType = undefined;
    transaction.previewUrl = undefined;
  }

  uploadFile(transaction: Transaction): void {
    if (!transaction.selectedFile) return;

    // Create a proper input element to simulate the file selection event
    const input = document.createElement('input');
    input.type = 'file';
    input.files = new DataTransfer().files;
    // Add the selected file to the input's file list
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(transaction.selectedFile);
    input.files = dataTransfer.files;

    // Call the existing upload method with proper event typing
    this.onFileSelected({ target: input } as unknown as Event, transaction.transaction_id);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  selectPaymentMethod(transaction: Transaction, method: string): void {
    // Check if method is online but no QR code is available
    if (method === 'online' && !transaction.qr_code_url) {
      console.warn('Cannot select online payment: No QR code available');
      return; // Prevent selection
    }
    
    // Store the selected payment method using the transaction_id as the key
    this.selectedPaymentMethod[transaction.transaction_id] = method;
    
    if (method === 'cash') {
      console.log('Cash payment selected for transaction:', transaction.transaction_id);
      // Hide QR code if it was previously showing
      if (transaction.qr_code_url) {
        console.log('Cash payment selected, hiding QR code');
      }
    } else if (method === 'online') {
      console.log('Online payment selected for transaction:', transaction.transaction_id);
    }
  }
  
  refreshTransactions(): void {
    this.loadTransactions();
  }

  // Open image modal to view receipt
  openImageModal(imageUrl: string, type: 'receipt' | 'qrcode'): void {
    this.modalImageUrl = imageUrl;
    this.modalImageType = type;
    this.modalImageTitle = type === 'receipt' ? 'Payment Receipt' : 'Payment QR Code';
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