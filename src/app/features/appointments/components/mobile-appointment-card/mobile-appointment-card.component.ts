import { Component, input, output, inject } from '@angular/core';
import { AppointmentModel } from '@models/appointment.model';
import { StatusTranslatePipe } from '@core/pipes/translate.pipe';
import { TypeTranslatePipe } from '@core/pipes/type-translate.pipe';
import { LucideAngularModule, Clock, Edit, AlertCircle, Ban, CheckCircle, XCircle } from 'lucide-angular';
import { CompleteButtonComponent } from '@features/appointments/components/complete-button/complete-button.component';
import { CancelButtonComponent } from '@features/appointments/components/cancel-button/cancel-button.component';
import { DuplicateButtonComponent } from '@features/appointments/components/duplicate-button/duplicate-button.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';
import { HelperService } from '@core/services/helper.service';

@Component({
  selector: 'app-mobile-appointment-card',
  imports: [
    StatusTranslatePipe,
    TypeTranslatePipe,
    LucideAngularModule,
    CompleteButtonComponent,
    CancelButtonComponent,
    DuplicateButtonComponent,
    TranslocoPipe,
    NgxPermissionsModule,
  ],
  templateUrl: './mobile-appointment-card.component.html',
  styleUrl: './mobile-appointment-card.component.scss',
})
export class MobileAppointmentCardComponent {
  readonly appointment = input.required<AppointmentModel>();
  readonly edit = output<AppointmentModel>();
  readonly reload = output<void>();

  private readonly helperService = inject(HelperService);

  protected readonly Clock = Clock;
  protected readonly Edit = Edit;
  protected readonly AlertCircle = AlertCircle;
  protected readonly Ban = Ban;
  protected readonly CheckCircle = CheckCircle;
  protected readonly XCircle = XCircle;
  protected readonly AppointmentStatus = AppointmentStatus;
  protected readonly userRole = UserRole;

  onEdit() {
    this.edit.emit(this.appointment());
  }

  onReload() {
    this.reload.emit();
  }

  getFormattedDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getFormattedTime(time: string): string {
    return time.slice(0, 5);
  }

  onCardClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('app-complete-button') || target.closest('app-cancel-button') || target.closest('app-duplicate-button')) {
      return;
    }
    this.helperService.openDetails(this.appointment());
  }

  getStatusIcon(status: AppointmentStatus) {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return this.CheckCircle;
      case AppointmentStatus.CANCELLED:
        return this.XCircle;
      case AppointmentStatus.TEMPORARY:
        return this.AlertCircle;
      case AppointmentStatus.CANCELLED_FOREVER:
        return this.Ban;
      default:
        return this.Clock;
    }
  }
}

