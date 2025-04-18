import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  booking: any = {
    title: '',
    description: '',
    image: null,
    cost: 0,
    time: ''
  };


  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.worker = {
        id: params['id'],
        name: params['name'],
        job: params['job']
      };
  
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
        this.http.get<{ data: Availableevents[] }>(`http://localhost:8000/api/getavailabledate/${this.worker.id}`, { headers })
          .subscribe(
            (response) => {
              this.availableevents = response.data || [];
              this.populateCalendarEvents();
            },
            (error) => {
              if (error.status === 401) {
                alert('Unauthorized! Please log in again.');
                this.router.navigate(['/login']);
              } else {
                console.error('Error loading events:', error);
              }
            }
          );
      }
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
      events: [],
    };
  }
  
  populateCalendarEvents() {
    const bookedEvents = this.availableevents.map(event => {
      // Magdagdag ng 1 araw sa end date
      const adjustedEndDate = new Date(event.end);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
  
      return {
        title: "BOOKED",
        start: event.start,
        end: adjustedEndDate, // Gamitin ang adjusted end date
        backgroundColor: 'red',
        borderColor: 'red',
      };
    });
    this.calendarOptions!.events = bookedEvents;
  }

  handleDateClick(event: any) {
    const clickedDate = new Date(event.dateStr);
    const today = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const todayInManila = new Date(today);
    this.booking = { title: '', description: '', image: null, time: '' };
  
    if (clickedDate < todayInManila) {
      alert('You can only select today or future dates.');
      return;
    }
  
    if (!this.selectedDate) {
      if (this.isDateBooked(clickedDate)) {
        alert('The selected start date is already booked. Please choose another date.');
        return;
      }
      this.selectedDate = clickedDate;
      this.isSelectingEndDate = true;
    } else if (this.isSelectingEndDate) {
      if (clickedDate >= this.selectedDate) {
        if (this.isDateRangeBooked(this.selectedDate, clickedDate)) {
          alert('The chosen date range conflicts with an existing booking. Please select a different range.');
          return;
        }
        this.endDate = clickedDate;
        this.isSelectingEndDate = false;
      } else {
        alert('End date must be the same or after the start date.');
      }
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

  // transformCost(value: string): number {
  //   return parseFloat(value.replace(/,/g, ''));
  // }

  submitBooking() {
    const formData = new FormData();
    // formData.append('cost', String(this.transformCost(this.booking.cost)));
    formData.append('worker_id', this.worker.id);
    formData.append('title', this.booking.title);
    formData.append('description', this.booking.description);
    formData.append('cost', String(Number(this.booking.cost)));
    formData.append('start_date', this.selectedDate?.toISOString() || '');
    formData.append('end_date', this.endDate?.toISOString() || '');
    formData.append('time', this.booking.time);

    if (this.booking.image) {
      formData.append('image', this.booking.image, this.booking.image.name);
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('authToken')}`
    );

    this.http
      .post('http://localhost:8000/api/bookings', formData, { headers })
      .subscribe(
        (response) => {
          alert('Booking successful!');
          this.router.navigate(['/home']);
        },
        (error) => {
          if (error.status === 201) {
            alert('Booking successful!');
            this.router.navigate(['/home']);
          } else {
            console.error('Booking failed:', error);
            alert('Booking failed!');
          }
        }
      );
  }
}
