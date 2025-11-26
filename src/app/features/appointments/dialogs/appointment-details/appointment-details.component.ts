import { Component, DestroyRef, inject, output } from '@angular/core';
import {
  LucideAngularModule,
  LucideCalendar,
  LucideClipboard,
  LucideClock,
  LucideFileText,
  LucideStethoscope,
  LucideUser,
  LucideX,
  Copy,
  Pencil,
  CheckCircle,
  CircleX,
} from 'lucide-angular';
import { AppointmentModel } from '@models/appointment.model';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { DatePipe, NgClass } from '@angular/common';
import { AddMinutesPipe } from '@core/pipes/add-minutes.pipe';
import { TypeTranslatePipe } from '@core/pipes/type-translate.pipe';
import { StatusTranslatePipe } from '@core/pipes/translate.pipe';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppointmentService } from '@core/services/appointment.service';
import { DuplicateAppointmentComponent } from '@features/appointments/dialogs/duplicate-appointment/duplicate-appointment.component';
import { CancelAppointmentComponent } from '@features/appointments/dialogs/cancel-appointment/cancel-appointment.component';
import { ManageAppointmentComponent } from '@features/appointments/dialogs/manage-appointment/manage-appointment.component';
import { PaymentDialogComponent } from '@features/appointments/dialogs/payment-dialog/payment-dialog.component';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-appointment-details',
  imports: [
    TranslocoPipe,
    LucideAngularModule,
    DatePipe,
    NgClass,
    AddMinutesPipe,
    TypeTranslatePipe,
    StatusTranslatePipe,
    MatDialogClose,
    NgxPermissionsModule,
  ],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss',
})
export class AppointmentDetailsComponent {
  private translocoService = inject(TranslocoService);
  public data: AppointmentModel = inject(MAT_DIALOG_DATA);
  private appointmentService = inject(AppointmentService);
  private matDialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<AppointmentDetailsComponent>);
  private destroyRef = inject(DestroyRef);
  readonly reload = output<void>();

  readonly User = LucideUser;
  readonly Calendar = LucideCalendar;
  readonly Clock = LucideClock;
  readonly Clipboard = LucideClipboard;
  readonly Stethoscope = LucideStethoscope;
  readonly FileText = LucideFileText;
  readonly Close = LucideX;
  readonly Cancel = CircleX;
  readonly Copy = Copy;
  readonly Finished = CheckCircle;
  readonly Edit = Pencil;
  protected readonly userRole = UserRole;

  appointment = rxResource({
    stream: () => this.appointmentService.getAppointment(this.data.id),
  });

  public duplicateAppointment(): void {
    this.matDialog
      .open(DuplicateAppointmentComponent, {
        data: { id: this.data.id },
        width: '500px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
          console.log(
            this.translocoService.translate('app-dialog.duplicate_success'),
          );
        }
      });
  }

  public cancelAppointment(): void {
    this.matDialog
      .open(CancelAppointmentComponent, {
        data: { id: this.data.id },
        width: 'full',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
          console.log(
            this.translocoService.translate('app-dialog.cancel_success'),
          );
        }
      });
  }

  public editAppointment(): void {
    const dialogRef = this.matDialog.open(ManageAppointmentComponent, {
      data: {
        doctorId: this.data.doctor.id,
        time: this.data.time,
        date: this.data.date,
        appointments: [this.data],
        appointment: this.data,
      },
      width: '100%',
      maxWidth: '800px',
      height: '900px',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: AppointmentModel | undefined) => {
        if (result) {
          const payload = {
            doctorId: result.doctor.id,
            patientId: result.patient.id,
            date: result.date,
            time: result.time,
            duration: result.duration,
            status: result.status,
          };

          this.appointmentService
            .updateAppointment(result.id, payload)
            .subscribe({
              next: () => {
                Object.assign(this.data, result);
                this.dialogRef.close(true);
              },
              error: (err) => {
                console.error('Ошибка при обновлении:', err);
              },
            });
        }
      });
  }

  public completeAppointment(): void {
    const dialogRef = this.matDialog.open(PaymentDialogComponent, {
      data: this.data.id,
      disableClose: true,
      width: '500px'
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: boolean) => {
        if (res) {
          this.data.status = AppointmentStatus.COMPLETED;
          this.dialogRef.close(true);
        }
      });
  }
}
