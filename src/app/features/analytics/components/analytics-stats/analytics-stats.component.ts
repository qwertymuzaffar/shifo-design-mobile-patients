import { Component, input } from '@angular/core';
import { StatCardComponent } from 'app/components/stat-card/stat-card.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { Activity, Calendar, DollarSign, LucideAngularModule, TrendingUp, Users } from 'lucide-angular';
import { AnalyticsResponse } from '@features/analytics/models/analytics.models';
import { DoctorListResponse } from '@features/doctor/models/doctor';

@Component({
  selector: 'app-analytics-stats',
  standalone: true,
  imports: [
    StatCardComponent,
    TranslocoPipe,
    LucideAngularModule,
  ],
  templateUrl: './analytics-stats.component.html',
  styleUrl: './analytics-stats.component.scss',
})
export class AnalyticsStatsComponent {
  analyticsData = input<AnalyticsResponse | null>(null);
  doctorData = input<DoctorListResponse | null>(null);

  protected readonly Activity = Activity;
  protected readonly TrendingUp = TrendingUp;
  protected readonly Users = Users;
  protected readonly DollarSign = DollarSign;
  protected readonly Calendar = Calendar;
}

