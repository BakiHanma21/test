import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  // Default message, type, and proposed cost
  message: string = 'Please provide your message for the skilled worker.'; // Default message
  type: string = 'info'; // Default type (can be 'info', 'error', or 'success')
  proposedCost: number | null = 200; // Default proposed cost

  imageFile: File | null = null;
  additionalDetails: string = '';
  typedMessage: string = '';  // Holds the typed message from the user
  isAgreed: boolean = false;
  isMobileView: boolean = false;

  ngOnInit() {
    // Check screen size on component init
    this.checkScreenSize();
    // Add listener for screen resize
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  // Handle file upload
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  // Handle form submission
  submitForm() {
    if (this.isAgreed) {
      const formData = new FormData();
      if (this.imageFile) formData.append('image', this.imageFile);
      if (this.additionalDetails) formData.append('details', this.additionalDetails);
      if (this.typedMessage) formData.append('typedMessage', this.typedMessage);
      formData.append('agreed', String(this.isAgreed)); // Always include the agreement

      // Simulate form submission (e.g., send to a server)
      this.showSuccess('Message sent successfully!');
      console.log('Form Data:', formData);
    } else {
      this.showError('Please agree to the proposed cost before submitting.');
    }
  }

  // Handle Disagree action
  disagree() {
    this.isAgreed = false;  // Uncheck the agreement
    this.showInfo('You have disagreed with the proposed cost.');
  }

  // Show success message
  showSuccess(message: string) {
    this.message = message;
    this.type = 'success';
    this.proposedCost = null; // Hide the form after successful submission
  }

  // Show error message
  showError(message: string) {
    this.message = message;
    this.type = 'error';
  }

  // Show info message
  showInfo(message: string) {
    this.message = message;
    this.type = 'info';
  }

  // Check screen size for responsive layout
  private checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  ngOnDestroy() {
    // Clean up event listener
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }
}
