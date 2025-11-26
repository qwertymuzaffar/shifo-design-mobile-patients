import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DoctorRating } from '@features/analytics/models/analytics.models';
import { EfficiencyBadgeComponent } from '../efficiency-badge/efficiency-badge.component';

@Component({
  selector: 'app-doctor-rating-table',
  standalone: true,
  imports: [
    TranslocoPipe,
    EfficiencyBadgeComponent,
  ],
  templateUrl: './doctor-rating-table.component.html',
  styleUrl: './doctor-rating-table.component.scss',
})
export class DoctorRatingTableComponent {
  doctorRatings = input.required<DoctorRating[]>();
}

