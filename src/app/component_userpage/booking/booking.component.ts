import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../services/auth.service';
import { BookingService, WorkerSchedule, WorkerAvailability } from './booking.service';
import Swal from 'sweetalert2';

interface Availableevents {
  booking_id: number;
  title: string;
  start: Date;
  end: Date;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: true,
  imports: [FullCalendarModule, FormsModule, CommonModule]
})
export class BookingComponent implements OnInit {
  worker: any = {};
  availableevents: Availableevents[] = [];
  calendarOptions: CalendarOptions | undefined;
  selectedDate: Date | null = null;
  endDate: Date | null = null;
  selectedFileName: string | null = null;
  isSelectingEndDate: boolean = false;
  showBookingForm: boolean = false;
  workerSchedule: WorkerSchedule | null = null;
  isCheckingAvailability: boolean = false;

  booking: any = {
    title: '',
    description: '',
    image: null,
    cost: 0,
    time: ''
  };

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.worker = {
        id: params['id'],
        name: params['name'],
        job: params['job']
      };
  
      this.loadWorkerSchedule();
      this.loadAvailableDates();
    });
    
    const todayInManila = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
  
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay',
      },
      timeZone: 'Asia/Manila',
      validRange: {
        start: todayInManila.split(',')[0],
      },
      dateClick: (info) => {
        this.handleDateClick(info);
      },
      eventClick: (info) => {
        const event = info.event;
        const description = event.extendedProps && event.extendedProps['description'];
        const type = event.extendedProps && event.extendedProps['type'];
        
        if (description) {
          Swal.fire({
            title: event.title,
            html: `
              <div class="text-left">
                <p><strong>Type:</strong> ${type || 'Booking'}</p>
                <p><strong>Date:</strong> ${event.startStr}</p>
                <p><strong>Description:</strong> ${description}</p>
              </div>
            `,
            confirmButtonColor: '#3085d6',
          });
        }
      },
      events: [],
      displayEventTime: false,
      eventDisplay: 'block',
      eventContent: (arg) => {
        return { html: `<div class="event-title">${arg.event.title}</div>` };
      }
    };
  }
  
  updateCalendarEvents() {
    let events = [];

    // Add worker's bookings from schedules
    if (this.workerSchedule && this.workerSchedule.schedules) {
      this.workerSchedule.schedules.forEach(schedule => {
        // Create date objects
        const startDate = new Date(schedule.date);
        let endDate;
        
        if (schedule.end_date) {
          // If there's an end_date, use it and add 1 day to include the end date
          endDate = new Date(schedule.end_date);
          endDate.setDate(endDate.getDate() + 1);
        } else {
          // If no end_date, it's a single day event
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);
        }

        // Log the schedule for debugging
        console.log('Adding schedule to calendar:', {
          title: schedule.title,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          type: schedule.type,
          has_end_date: !!schedule.end_date
        });

        // Add booked event
        events.push({
          title: schedule.title,
          start: startDate,
          end: endDate,
        backgroundColor: '#ffebee',
        borderColor: '#ef5350',
        textColor: '#d32f2f',
          classNames: ['booked-date'],
          display: 'block',
          extendedProps: {
            description: schedule.description,
            type: schedule.type
          }
        });
    });
    }

    // Add selected date range if exists
    if (this.selectedDate) {
      // Single date selection
      if (!this.endDate) {
        events.push({
          title: 'Selected',
          start: this.selectedDate,
          end: new Date(this.selectedDate.getTime() + 24 * 60 * 60 * 1000), // Add 1 day
          backgroundColor: '#c8e6c9',
          borderColor: '#4caf50',
          textColor: '#2e7d32',
          classNames: ['selected-date'],
          display: 'block'
        });
      } else {
        // Range selection - add as one continuous event
        const rangeEnd = new Date(this.endDate);
        rangeEnd.setDate(rangeEnd.getDate() + 1); // Add 1 day to include the end date

        events.push({
          title: 'Selected Date Range',
          start: this.selectedDate,
          end: rangeEnd,
          backgroundColor: '#c8e6c9',
          borderColor: '#4caf50',
          textColor: '#2e7d32',
          classNames: ['selected-range'],
          display: 'block'
        });
      }
    }

    if (this.calendarOptions) {
      this.calendarOptions.events = events;
    }
  }

  async handleDateClick(event: any) {
    const clickedDate = new Date(event.dateStr);
    const today = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const todayInManila = new Date(today);
    this.booking = { title: '', description: '', image: null, time: '' };
  
    if (clickedDate < todayInManila) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'You can only select today or future dates.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
  
    this.isCheckingAvailability = true;
    try {
      const availabilityResponse = await this.bookingService.checkWorkerAvailability(
        this.worker.id,
        clickedDate.toISOString().split('T')[0],
        this.booking.time || '00:00'
      ).toPromise();

      if (!availabilityResponse) {
        throw new Error('No response from availability check');
      }

      // Update workerSchedule with conflicts if any
      if (this.workerSchedule) {
        this.workerSchedule = {
          ...this.workerSchedule,
          conflicts: availabilityResponse.conflicts
        };
      }

      if (!availabilityResponse.isAvailable) {
        let conflictMessage = 'The worker is not available on this date due to:\n\n';
        availabilityResponse.conflicts.forEach(conflict => {
          conflictMessage += `- ${conflict.type.toUpperCase()}: ${conflict.title} on ${conflict.date}`;
          if (conflict.time) {
            conflictMessage += ` at ${conflict.time}`;
          }
          conflictMessage += '\n';
        });

        Swal.fire({
          icon: 'warning',
          title: 'Worker Not Available',
          text: conflictMessage,
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      if (!this.selectedDate) {
      this.selectedDate = clickedDate;
      this.isSelectingEndDate = true;
      this.updateCalendarEvents();
    } else if (this.isSelectingEndDate) {
      if (clickedDate >= this.selectedDate) {
        this.endDate = clickedDate;
        this.isSelectingEndDate = false;
        this.updateCalendarEvents();
      } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Date',
            text: 'End date must be the same or after the start date.',
            confirmButtonColor: '#3085d6',
          });
      }
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to check worker availability. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      this.isCheckingAvailability = false;
    }
  }

  isDateBooked(date: Date): boolean {
    return this.availableevents.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return date >= eventStart && date <= eventEnd;
    });
  }

  isDateRangeBooked(startDate: Date, endDate: Date): boolean {
  for (let event of this.availableevents) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    if ((startDate >= eventStart && startDate <= eventEnd) || (endDate >= eventStart && endDate <= eventEnd)) {
      return true;
    }
  }
  return false;
}
  

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.booking.image = file;
      console.log('Selected image:', file);
    }
  }

  handleFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFileName = file.name;
        this.booking.image = file;
        console.log('Dropped image:', file);
      } else {
        alert('Please drop an image file');
      }
    }
  }

  proceedToBookingForm() {
    if (this.selectedDate && this.endDate) {
      this.showBookingForm = true;
      // Scroll to top when showing the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  resetBooking() {
    this.selectedDate = null;
    this.endDate = null;
    this.isSelectingEndDate = false;
    this.selectedFileName = null;
    this.showBookingForm = false;
    this.booking = {
      title: '',
      description: '',
      image: null,
      cost: 0,
      time: ''
    };
    this.updateCalendarEvents();
  }

  isFormValid(): boolean {
    return (
      this.booking.title.trim() !== '' &&
      this.booking.description.trim() !== '' &&
      this.booking.cost > 0 &&
      this.booking.time !== '' &&
      this.selectedDate !== null &&
      this.endDate !== null
    );
  }

  // transformCost(value: string): number {
  //   return parseFloat(value.replace(/,/g, ''));
  // }

  loadWorkerSchedule() {
    this.bookingService.getWorkerSchedule(this.worker.id).subscribe(
      (response: WorkerSchedule) => {
        this.workerSchedule = response;
        console.log('Worker schedule loaded:', this.workerSchedule);
        
        // Log details about the schedules
        if (this.workerSchedule.schedules && this.workerSchedule.schedules.length > 0) {
          console.log('Schedule details:');
          this.workerSchedule.schedules.forEach((schedule, index) => {
            console.log(`Schedule ${index + 1}:`, {
              title: schedule.title,
              date: schedule.date,
              end_date: schedule.end_date || 'N/A',
              type: schedule.type
            });
          });
        }
        
        // Update calendar after loading schedules
        this.updateCalendarEvents();
      },
      (error: any) => {
        console.error('Error loading worker schedule:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load worker schedule. Please try again later.',
          confirmButtonColor: '#3085d6',
        });
      }
    );
  }

  loadAvailableDates() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
      this.http.get<{ data: Availableevents[] }>(`${API_URL}/getavailabledate/${this.worker.id}`, { headers })
        .subscribe(
          (response) => {
            this.availableevents = response.data || [];
            this.updateCalendarEvents();
          },
          (error) => {
            if (error.status === 401) {
              Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'Please log in again to continue.',
                confirmButtonColor: '#3085d6',
              }).then(() => {
                this.router.navigate(['/login']);
              });
            } else {
              console.error('Error loading events:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load available dates. Please try again later.',
                confirmButtonColor: '#3085d6',
              });
            }
          }
        );
    }
  }

  submitBooking() {
    // Validate required fields
    if (!this.booking.title || !this.booking.description || !this.booking.time || !this.selectedDate || !this.endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validate cost
    if (this.booking.cost <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Cost',
        text: 'Please enter a valid cost greater than 0.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const formData = new FormData();
    
    // Add required fields
    formData.append('worker_id', this.worker.id.toString());
    formData.append('title', this.booking.title);
    formData.append('description', this.booking.description);
    formData.append('cost', this.booking.cost.toString());
    formData.append('start_date', this.selectedDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    formData.append('end_date', this.endDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    formData.append('time', this.booking.time);

    // Add image if exists
    if (this.booking.image) {
      formData.append('image', this.booking.image, this.booking.image.name);
    }

    // Log the form data for debugging
    console.log('Submitting booking with data:', {
      worker_id: this.worker.id,
      title: this.booking.title,
      description: this.booking.description,
      cost: this.booking.cost,
      start_date: this.selectedDate.toISOString().split('T')[0],
      end_date: this.endDate.toISOString().split('T')[0],
      time: this.booking.time,
      has_image: !!this.booking.image
    });

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('authToken')}`
    );

    Swal.fire({
      title: 'Confirm Booking',
      text: 'Are you sure you want to proceed with this booking?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, book it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
    this.http
      .post(`${API_URL}/bookings`, formData, { headers })
          .subscribe({
            next: (response) => {
              console.log('Booking successful:', response);
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your booking has been confirmed.',
                confirmButtonColor: '#3085d6',
              }).then(() => {
          this.router.navigate(['/home']);
              });
        },
            error: (error) => {
            console.error('Booking failed:', error);
              let errorMessage = 'There was an error processing your booking. Please try again.';
              
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else if (error.status === 422) {
                errorMessage = 'Please check your input and try again.';
              } else if (error.status === 401) {
                errorMessage = 'Your session has expired. Please log in again.';
                this.router.navigate(['/login']);
              }

              Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: errorMessage,
                confirmButtonColor: '#3085d6',
              });
          }
          });
      }
    });
  }
}
