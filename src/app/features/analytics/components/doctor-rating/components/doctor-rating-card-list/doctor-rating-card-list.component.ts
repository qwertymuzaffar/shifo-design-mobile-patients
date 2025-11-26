import { Component, input } from '@angular/core';
import { DoctorRating } from '@features/analytics/models/analytics.models';
import { DoctorRatingCardComponent } from '../doctor-rating-card/doctor-rating-card.component';

@Component({
  selector: 'app-doctor-rating-card-list',
  standalone: true,
  imports: [
    DoctorRatingCardComponent,
  ],
  templateUrl: './doctor-rating-card-list.component.html',
  styleUrl: './doctor-rating-card-list.component.scss',
})
export class DoctorRatingCardListComponent {
  doctorRatings = input.required<DoctorRating[]>();
}

