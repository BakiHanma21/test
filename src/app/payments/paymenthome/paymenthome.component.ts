import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-paymenthome',
  templateUrl: './paymenthome.component.html',
  styleUrls: ['./paymenthome.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PaymenthomeComponent {
  isModalOpen: boolean = false; // Tracks modal visibility
  selectedPaymentMethod: string = ''; // Tracks the selected payment method (GCash or PayMaya)
  isMpinModalOpen: boolean = false;
  constructor() {}
  openModal(paymentMethod: string): void {
  // Open the modal with the selected payment methodopenModal(paymentMethod: string): void {
    this.isModalOpen = true;
    this.selectedPaymentMethod = paymentMethod;
  }

  // Close the mobile number modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Open the MPIN modal
  openMpinModal(): void {
    this.isModalOpen = false; // Close the first modal
    this.isMpinModalOpen = true; // Open the second modal
  }

  // Close the MPIN modal
  closeMpinModal(): void {
    this.isMpinModalOpen = false;
  }

  // Confirm payment
  confirmPayment(): void {
    alert(`Payment confirmed using ${this.selectedPaymentMethod}`);
    this.closeMpinModal();
  }
}
