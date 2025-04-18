import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  // Default message, type, and proposed cost
  message: string = 'Please provide your message for the skilled worker.'; // Default message
  type: string = 'info'; // Default type (can be 'info', 'error', or 'success')
  proposedCost: number | null = 200; // Default proposed cost

  imageFile: File | null = null;
  additionalDetails: string = '';
  typedMessage: string = '';  // Holds the typed message from the user
  isAgreed: boolean = false;

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
      alert('Message sent successfully!');
      console.log('Form Data:', formData);
    } else {
      alert('Please agree to the proposed cost before submitting.');
    }
  }

  // Handle Disagree action
  disagree() {
    this.isAgreed = false;  // Uncheck the agreement
    alert('You have disagreed with the proposed cost.');
  }
}
