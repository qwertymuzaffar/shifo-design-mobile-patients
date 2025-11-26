import { Component, input, computed } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgStyle } from '@angular/common';
import { AnalyticsResponse } from '@features/analytics/models/analytics.models';

@Component({
  selector: 'app-appointment-status-types',
  standalone: true,
  imports: [
    TranslocoPipe,
    NgStyle,
  ],
  templateUrl: './appointment-status-types.component.html',
  styleUrl: './appointment-status-types.component.scss',
})
export class AppointmentStatusTypesComponent {
  analyticsData = input<AnalyticsResponse | null>(null);

  private readonly maxConsultations = 100;
  private readonly maxProcedure = 100;

  getPercent(type: 'consultation' | 'procedure'): number {
    const value = this.analyticsData()?.appointmentTypes?.[type] || 0;
    const max = type === 'consultation' ? this.maxConsultations : this.maxProcedure;
    const percent = (value / max) * 100;
    return Math.min(percent, 100);
  }

  getColor(type: 'consultation' | 'procedure'): string {
    const percent = this.getPercent(type);
    if (percent < 30) return '#ef4444';
    if (percent < 70) return '#facc15';
    return '#22c55e';
  }
}

