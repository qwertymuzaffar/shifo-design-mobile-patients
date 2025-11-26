import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DoctorRating } from '@features/analytics/models/analytics.models';
import { EfficiencyBadgeComponent } from '../efficiency-badge/efficiency-badge.component';

@Component({
  selector: 'app-doctor-rating-card',
  standalone: true,
  imports: [
    TranslocoPipe,
    EfficiencyBadgeComponent,
  ],
  templateUrl: './doctor-rating-card.component.html',
  styleUrl: './doctor-rating-card.component.scss',
})
export class DoctorRatingCardComponent {
  doctor = input.required<DoctorRating>();
}

