import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.reportForm = this.fb.group({
      reportedPerson: ['', Validators.required],
      reason: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.reportForm.valid) {
      const reportData = this.reportForm.value;
  
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.post(`http://localhost:8000/api/add-reports`, reportData, { headers }).subscribe({
          next: (response: any) => {
            console.log('Report Submitted:', response);
            this.simulateResponse();
          },
          error: (error) => {
            console.error('Error submitting report:', error);
          },
        });
      } else {
        console.log('User not authenticated. Redirecting to login...');
        this.router.navigate(['/login']);
      }
    } else {
      console.log('Form is invalid');
    }
  }
  


  simulateResponse() {
    setTimeout(() => {
      this.responseDate = new Date();
      this.responseMessage = {
        message: 'Thank you for your report. It is under review.',
        status: 'Pending', // Set the response status (can be changed based on actual data)
      };
  
      this.reportForm.disable();
    }, 2000); 
  }
  
}
