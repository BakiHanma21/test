import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reporting-message',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './reporting-message.component.html',
  styleUrls: ['./reporting-message.component.css'],
})
export class ReportingMessageComponent implements OnInit {
  reportForm: FormGroup;
  responseStatus: { message: string; status: string } | null = null;
  responseMessage: { message: string; status: string } | null = null;
  responseDate: Date | null = null;

  constructor(private fb: FormBuilder) {
    // Initialize the form with necessary fields and validation
    this.reportForm = this.fb.group({
      reportedPerson: ['', Validators.required],
      reason: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  // Function to handle form submission
  onSubmit(): void {
    if (this.reportForm.valid) {
      console.log('Report Submitted:', this.reportForm.value);
      // Here you can add the logic to send this data to a service or API
    } else {
      console.log('Form is invalid');
    }

    const reportData = this.reportForm.value;

    // Simulate a response after submission
    this.responseStatus = {
      message: 'The reported person has been contacted.',
      status: 'Pending', // This can be updated to 'Resolved' based on the response
    };
    this.simulateResponse();
  }

  simulateResponse() {
    // This function simulates a response being added after the form is submitted
    setTimeout(() => {
      this.responseDate = new Date(); // Set current date as response date
      this.responseMessage = {
        message: 'Thank you for your report. It is under review.',
        status: 'Pending', // Set the response status (can be changed based on actual data)
      }; // Correct the assignment to an object with message and status
    }, 2000); // Simulate a response after 2 seconds
  }
}
