import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { RequestCalendarService } from '../../services/requestcalendar.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MatCardModule, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, AfterViewInit { 
  @ViewChild('calendar') calendar: any;  
  calendarOptions!: CalendarOptions;
  selectedEvent: any;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private requestCalendarService: RequestCalendarService 
  ) {}

  ngOnInit(): void {
    this.requestCalendarService.getEvents();
    this.requestCalendarService.events$.subscribe(events => {
      const formattedEvents = events.map(event => ({
        ...event,
        start: new Date(event.start).toISOString(),
        end: new Date(event.end).toISOString(),
      }));
  
      this.calendarOptions = {
        initialView: 'dayGridMonth',
        events: formattedEvents,
        plugins: [dayGridPlugin, interactionPlugin],
        editable: false,
        selectable: true,
        eventClick: (eventInfo) => this.onEventClick(eventInfo),
      };
      
  
      console.log('Formatted Events', formattedEvents);
    });
  }
  

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.calendar) {
        const calendarApi = this.calendar.getApi();
        if (calendarApi) {
          calendarApi.refetchEvents();
        }
      }
    }, 0);
  }

  onDateClick(info: any) {
    const eventsArray = Array.isArray(this.calendarOptions.events) ? this.calendarOptions.events : [];
    
    const existingEvent = eventsArray.find((event: any) => 
      event.start === info.dateStr + 'T09:00:00'
    );
  
    if (existingEvent) {
      alert('This time slot is already booked. Please choose a different time.');
    } else {
      const title = prompt('Enter the booking title:');
      if (title) {
        const newEvent = {
          title,
          start: info.dateStr,
          end: info.dateStr,
          status: 'Available',
          extendedProps: {
            status: 'Available'
          }
        };
  
        if (this.calendar) {
          const calendarApi = this.calendar.getApi();
          calendarApi.addEvent(newEvent);
          calendarApi.refetchEvents();
        }
      }
    }
  }

  onEventClick(event: any) {
    const clickedEvent = event.event;
  
    this.selectedEvent = {
      title: clickedEvent._def.title,
      description: clickedEvent._def.extendedProps.description,
      start: clickedEvent._instance.range.start,
      end: clickedEvent._instance.range.end,
      extendedProps: clickedEvent._def.extendedProps,
    };
  
    console.log('Clicked event details:', this.selectedEvent);
  }
  
  
  

  onEventDrop(info: any) {
    info.event.setExtendedProp('status', 'Moved');
  }

  onDatesRender(event: any) {
    console.log('Dates rendered:', event);
  }

  toggleAvailability(event: any) {
    if (event.extendedProps.status === 'Available') {
      event.setExtendedProp('status', 'Unavailable');
    } else {
      event.setExtendedProp('status', 'Available');
    }
    this.selectedEvent = event;
  }
}
