import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choices',
  templateUrl: './choices.component.html',
  styleUrls: ['./choices.component.css']
})
export class ChoicesComponent {

  constructor(private router: Router) {}

  navigateToUserRegistration() {
    this.router.navigate(['/user-registration']);
  }

  navigateToSkilledRegistration() {
    this.router.navigate(['/skilled-registration']);
  }
}
