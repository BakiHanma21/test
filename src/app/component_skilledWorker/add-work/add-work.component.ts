import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-work',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, CommonModule, MatCardModule],
  templateUrl: './add-work.component.html',
  styleUrls: ['./add-work.component.css']
})
export class AddWorkComponent {
  isProfileCompleted = false;

  worker: any = {
    name: '',
    location: '',
    availability: '',
    phone: '',
    email: '',
    mapsLink: '',
    skills: '',
    experience: '',
    workDone: '',
    workImage: null,
    profileImage: null
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get(`http://localhost:8000/api/profile`, { headers })
        .subscribe(
          (response: any) => {
            this.worker = response.data || this.worker;
            this.isProfileCompleted = !!response.data;
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

  constructor(private router: Router, private http: HttpClient) {}

  onImageSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'workImage') {
        this.worker.workImage = file;
      } else if (type === 'profileImage') {
        this.worker.profileImage = file;
      }
    }
  }

  submitProfile() {
    if (!this.worker.name || !this.worker.location || !this.worker.phone || !this.worker.email) {
      alert('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    Object.keys(this.worker).forEach(key => {
      if (this.worker[key]) {
        formData.append(key, this.worker[key]);
      }
    });

    this.http.post('http://localhost/APISW/insert_worker.php', formData).subscribe(
      response => {
        console.log('Profile Submitted Successfully:', response);
        alert('Profile submitted successfully!');
      },
      error => {
        console.error('Error Response:', error);
        if (error.error && typeof error.error === 'string') {
          console.error('Non-JSON Error:', error.error);
        }
      }
    );
  }
}
