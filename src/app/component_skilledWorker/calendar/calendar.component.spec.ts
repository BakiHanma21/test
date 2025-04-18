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
    this.requestCalendarService.events$.subscribe(events => {
      this.calendarOptions = {
        initialView: 'dayGridMonth',
        events: events,
        plugins: [dayGridPlugin, interactionPlugin],
        editable: false,
        selectable: true,
        eventClick: this.onEventClick.bind(this),
        eventDrop: (info) => this.onEventDrop(info),
      };
    });
  }

  ngAfterViewInit(): void {
    if (this.calendar) {
      const calendarApi = this.calendar.getApi();
    }
  }

  onEventClick(event: any) {
    this.selectedEvent = event.event;
  }

  onEventDrop(info: any) {
    info.event.setExtendedProp('status', 'Moved');
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
