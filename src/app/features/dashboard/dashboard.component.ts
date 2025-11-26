
import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from '@features/dashboard/dashboard-header/dashboard-header.component';
import {AlertTriangle, Calendar, Clock, CreditCard, TrendingUp, Users} from "lucide-angular";
import {AnalyticsResponse} from "@features/analytics/models/analytics.models";
import {AnalyticsService} from "@features/analytics/service/analytics.service";
import {AppointmentModel} from "@models/appointment.model";
import {AppointmentService} from "@core/services/appointment.service";
import {first} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {DashDialogComponent} from "@features/dashboard/dialog/dash-dialog.component";
import {StatCardComponent} from "@components/stat-card/stat-card.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { CommonModule } from '@angular/common';
import { Daum, Payments } from '@features/finances/components/payment/models/payment.models';
import { PaymentService } from '@features/finances/components/payment/services/payment.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';


@Component({
    selector: 'app-dashboard',
    imports: [TranslocoPipe, RouterModule, DashboardHeaderComponent, StatCardComponent, CommonModule],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  protected readonly Users = Users;
  protected readonly TrendingUp = TrendingUp;
  protected readonly Calendar = Calendar;
  protected readonly Clock = Clock;
  protected readonly CreditCard = CreditCard;
  protected readonly AlertTriangle = AlertTriangle;
  readonly analyticsData = signal<AnalyticsResponse | null>(null);
  private analyticsService = inject(AnalyticsService);
  readonly isLoading = signal<boolean>(false);
  readonly appointment = signal<AppointmentModel[]>([]);
  private appointmentService = inject(AppointmentService);
  private dialog = inject(MatDialog);
  private paymentsService = inject(PaymentService);
  private destroyRef = inject(DestroyRef);
  private translocoService = inject(TranslocoService)

  monthly(){
     return this.translocoService.translate('dashboard.monthly') 
  }
 

  monthlyIncome = signal<string>('0 TJS');
  percentMonth = signal<string>('0%');
  failedPaymentsStats = signal<{ count: number; total: string }>({ count: 0, total: '0 TJS' });

  ngOnInit(): void {
    this.isLoading.set(true);

    const { dateFrom, dateTo } = this.getCurrentMonthDateRange();

    this.analyticsService.getAnalytics(dateFrom, dateTo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.analyticsData.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка при получении аналитики:', err);
        this.isLoading.set(false);
      }
    });
    const today = new Date().toISOString().split('T')[0];
    this.getAppointments({ date: today });

    this.loadMonthlyIncome();
  }

  private getCurrentMonthDateRange(): { dateFrom: string; dateTo: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const dateFrom = new Date(year, month, 1);
    const dateTo = new Date(year, month + 1, 0);

    return {
      dateFrom: this.formatDate(dateFrom),
      dateTo: this.formatDate(dateTo),
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public openDialog(appointment: AppointmentModel): void {
    const dialogRef = this.dialog.open(DashDialogComponent, {
      data: appointment,
      width: '600px',
      height: '630px',
    });
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe();
  }

  public getAppointments(params: any) {
    this.isLoading.set(true);
    this.appointmentService.getAppointments(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filteredByDate = response.filter(app => {
          const appDate = new Date(app.date);
          appDate.setHours(0, 0, 0, 0);
          return appDate.getTime() === today.getTime();
        });

        const filteredByTime = filteredByDate.filter(app => {
          const [hours, minutes] = app.time.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes;
          const startMinutes = 8 * 60;
          const endMinutes = 18 * 60;
          return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
        });

        const sorted = filteredByTime.slice().sort((a, b) => {
          const [hA, mA] = a.time.split(':').map(Number);
          const [hB, mB] = b.time.split(':').map(Number);
          return hA * 60 + mA - (hB * 60 + mB);
        });
        this.appointment.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка при получении записей:', err);
        this.isLoading.set(false);
      }
    });
  }

  get upcomingAppointments(): AppointmentModel[] {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return this.appointment()?.filter(app => {
      const appDate = new Date(app.date);
      appDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appDate.getTime() !== today.getTime()) return false;
      const [h, m] = app.time.split(':').map(Number);
      return h * 60 + m >= currentMinutes;
    }) ?? [];
  }

  get nearestAppointment(): AppointmentModel | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = 18 * 60;

    return this.appointment()
      .filter(app => {
        const [h, m] = app.time.split(':').map(Number);
        const minutes = h * 60 + m;
        return minutes >= currentMinutes && minutes <= endMinutes;
      })
      .sort((a, b) => {
        const [hA, mA] = a.time.split(':').map(Number);
        const [hB, mB] = b.time.split(':').map(Number);
        return hA * 60 + mA - (hB * 60 + mB);
      })[0] ?? null;
  }


  private calculateIncomeForMonth(payments: Daum[], offset: number): { raw: number, formatted: string } {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);

    const filtered = payments.filter(p => {
      const date = new Date(p.paidAt || p.createdAt);
      const sameMonth = date.getMonth() === targetMonth.getMonth() && date.getFullYear() === targetMonth.getFullYear();
      const isPaid = p.status?.toLowerCase() === 'paid';
      return sameMonth && isPaid;
    });

    const total = filtered.reduce((sum, p) => {
      const amount = parseFloat(String(p.amount).replace(/[^\d,.-]/g, '').replace(',', '.'));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return {
      raw: total,
      formatted: total.toLocaleString(this.translocoService.translate('appointments.ruEn'), {
        style: 'currency',
        currency: 'TJS',
        minimumFractionDigits: 0
      })
    };
  }

  private loadMonthlyIncome() {
    this.paymentsService.getPayments({ limit: 1000 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: response => {
        const allPayments = response.data;

        const currentIncome = this.calculateIncomeForMonth(allPayments, 0);
        const previousIncome = this.calculateIncomeForMonth(allPayments, 1);

        this.monthlyIncome.set(currentIncome.formatted);
        this.percentMonth.set(this.calculateTrend(currentIncome.raw, previousIncome.raw));

        this.loadFailedPaymentsStats(response)
      },
      error: () => {
        this.monthlyIncome.set('');
        this.percentMonth.set('');
        this.failedPaymentsStats.set({ count: 0, total: '0 TJS' });
      }
    });
  }

  private calculateTrend(current: number, previous: number): string {
    if (previous === 0 && current > 0) return '+100% ';
    if (previous === 0 && current === 0) return '0%';
    const percent = ((current - previous) / previous) * 100;
    const rounded = Math.round(percent);
    const sign = rounded >= 0 ? '+' : '';
    return `${sign}${rounded}% `;
  }

  private loadFailedPaymentsStats(response: Payments) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const failedPayments = response.data.filter(p => {
          const date = new Date(p.paidAt || p.createdAt);
          const sameMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          const isFailed = p.status?.toLowerCase() === 'failed';
          return sameMonth && isFailed;
        });

        const total = failedPayments.reduce((sum, p) => {
          const cleanedAmount = String(p.amount).replace(/[^\d,.-]/g, '').replace(',', '.');
          const amount = parseFloat(cleanedAmount);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        this.failedPaymentsStats.set({
          count: failedPayments.length,
          total: total.toLocaleString(this.translocoService.translate('appointments.ruEn'), {
            style: 'currency',
            currency: 'TJS',
            minimumFractionDigits: 0
          })
        });
      }
  }
