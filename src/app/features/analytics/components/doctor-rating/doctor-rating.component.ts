import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DoctorRating } from '@features/analytics/models/analytics.models';
import { DoctorRatingTableComponent } from './components/doctor-rating-table/doctor-rating-table.component';
import { DoctorRatingCardListComponent } from './components/doctor-rating-card-list/doctor-rating-card-list.component';

@Component({
  selector: 'app-doctor-rating',
  standalone: true,
  imports: [
    TranslocoPipe,
    DoctorRatingTableComponent,
    DoctorRatingCardListComponent,
  ],
  templateUrl: './doctor-rating.component.html',
  styleUrl: './doctor-rating.component.scss',
})
export class DoctorRatingComponent {
  doctorRatings = input<DoctorRating[]>([]);
}

