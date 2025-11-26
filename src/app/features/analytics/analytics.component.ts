import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { AnalyticsService } from '@features/analytics/service/analytics.service';
import { AnalyticsResponse } from '@features/analytics/models/analytics.models';
import { DoctorListResponse } from '@features/doctor/models/doctor';
import { first } from 'rxjs';
import { DoctorService } from '@core/services/doctor.service';
import { NavigationEnd, Router } from '@angular/router';
import { getFirstDayOfMonth, getLastDayOfMonth } from '@core/utils/date.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsSkeletonComponent } from './skeleton/analytics-skeleton.component';
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component';
import { AnalyticsStatsComponent } from './components/analytics-stats/analytics-stats.component';
import { AppointmentStatusTypesComponent } from './components/appointment-status-types/appointment-status-types.component';
import { DoctorRatingComponent } from './components/doctor-rating/doctor-rating.component';
import { PaymentMethodsComponent } from './components/payment-methods/payment-methods.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    TranslocoPipe,
    AnalyticsSkeletonComponent,
    PeriodSelectorComponent,
    AnalyticsStatsComponent,
    AppointmentStatusTypesComponent,
    DoctorRatingComponent,
    PaymentMethodsComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private translocoService = inject(TranslocoService);
  readonly analyticsData = signal<AnalyticsResponse | null>(null);
  readonly data = signal<DoctorListResponse | null>(null);
  readonly isLoading = signal<boolean>(false);

  private analyticsService = inject(AnalyticsService);
  private doctorService = inject(DoctorService);
  private router = inject(Router);

  selectedDates = signal<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  firstDay = getFirstDayOfMonth();
  lastDay = getLastDayOfMonth();

  ngOnInit() {
    this.doctorService
      .getDoctor()
      .pipe(first())
      .subscribe((res) => this.data.set(res));

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (
          event instanceof NavigationEnd &&
          event.urlAfterRedirects === '/analytics'
        ) {
          this.loadAnalytics();
        }
      });
    this.selectedDates.set({ from: this.firstDay, to: this.lastDay });

    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.isLoading.set(true);

    const { from, to } = this.selectedDates();

    if (!from || !to) {
      this.selectedDates.set({ from: this.firstDay, to: this.lastDay });
      return this.loadAnalytics();
    }

    const dateFrom = this.formatDate(from);
    const dateTo = this.formatDate(to);

    this.analyticsService
      .getAnalytics(dateFrom, dateTo)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.analyticsData.set(response);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Ошибка при загрузке аналитики', err);
          this.isLoading.set(false);
        },
      });
  }

  onDatesChange(dates: { from: Date | null; to: Date | null }): void {
    // This is called when dates change in the picker, but before applying
  }

  onApplyDates(dates: { from: Date | null; to: Date | null }): void {
    this.selectedDates.set(dates);
    this.loadAnalytics();
  }

  onClearFilter(): void {
    this.selectedDates.set({ from: null, to: null });
    this.loadAnalytics();
  }

  private readonly fromTo: Record<string, string> = {
    ru: 'С',
    en: 'From',
  };

  readonly dateRangeText = computed(() => {
    const lang = this.translocoService.getActiveLang();
    const { from, to } = this.selectedDates();
    const dateLocale = this.translocoService.translate('appointments.ruEn');
    const selectPeriodText = this.translocoService.translate('analytics.selectPeriod');
    const fromPrefix = this.fromTo[lang] || this.fromTo['en'] || 'From';

    if (!from && !to) {
      return selectPeriodText;
    }

    if (from && !to) {
      try {
        return `${fromPrefix} ${from.toLocaleDateString(dateLocale)}`;
      } catch {
        return `${fromPrefix} ${from.toLocaleDateString()}`;
      }
    }

    if (from && to) {
      try {
        return `${from.toLocaleDateString(dateLocale)} - ${to.toLocaleDateString(dateLocale)}`;
      } catch {
        return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
      }
    }

    return selectPeriodText;
  });

  private formatDate(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
