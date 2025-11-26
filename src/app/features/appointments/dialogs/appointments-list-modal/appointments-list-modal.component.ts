import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { AppointmentModel } from '@models/appointment.model';
import {
  Calendar,
  Clock,
  FileText,
  LucideAngularModule,
  LucideEdit,
  LucideEye,
  Notebook,
  Plus,
  Stethoscope,
  User,
  X,
} from 'lucide-angular';
import { ManageAppointmentComponent } from '@features/appointments/dialogs/manage-appointment/manage-appointment.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogConfig } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { StatusTranslatePipe } from '@core/pipes/translate.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { CancelButtonComponent } from '@features/appointments/components/cancel-button/cancel-button.component';
import { CompleteButtonComponent } from '@features/appointments/components/complete-button/complete-button.component';
import { DuplicateButtonComponent } from '@features/appointments/components/duplicate-button/duplicate-button.component';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HelperService } from '@core/services/helper.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-appointments-list-modal',
  standalone: true,
  templateUrl: './appointments-list-modal.component.html',
  styleUrls: ['./appointments-list-modal.component.scss'],
  imports: [
    TranslocoPipe,
    SlicePipe,
    LucideAngularModule,
    DatePipe,
    MatDialogClose,
    StatusTranslatePipe,
    MatTooltip,
    CancelButtonComponent,
    CompleteButtonComponent,
    NgClass,
    DuplicateButtonComponent,
  ],
})
export class AppointmentsListModalComponent implements OnInit {

  constructor(private helper: HelperService) {}
  private translocoService = inject(TranslocoService);
  private matDialog = inject(MatDialog);
  private toastService = inject(ToastService);
  protected readonly Eye = LucideEye;
  protected readonly Edit = LucideEdit;
  protected readonly X = X;
  protected readonly Calendar = Calendar;
  protected readonly User = User;
  protected readonly Clock = Clock;
  protected readonly Stethoscope = Stethoscope;
  protected readonly FileText = FileText;
  protected readonly Plus = Plus;
  protected readonly Notebook = Notebook;
  private destroyRef = inject(DestroyRef);
  appointments: AppointmentModel[] = inject(MAT_DIALOG_DATA);

  ngOnInit() {
    this.sortAppointmentsByNearest();
  }

  getEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(0, 0, 0, hours, minutes);
    startDate.setMinutes(startDate.getMinutes() + duration);

    const endHours = String(startDate.getHours()).padStart(2, '0');
    const endMinutes = String(startDate.getMinutes()).padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  }

  private sortAppointmentsByNearest(): void {
    this.appointments.sort((a, b) => {
      const dateA = this.combineDateTime(a.date, a.time);
      const dateB = this.combineDateTime(b.date, b.time);
      return dateA.getTime() - dateB.getTime();
    });
  }

  private combineDateTime(dateString: string, timeString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  public addOrEdit(appointment?: AppointmentModel): void {
    const doctorId = this.appointments[0]?.doctor.id || null;
    const time = this.appointments[0]?.time || null;
    const date = this.appointments[0]?.date || null;
    const data: MatDialogConfig = {
      data: {
        doctorId,
        time,
        date,
        appointments: this.appointments,
        ...(appointment && { appointment }),
      },
      width: '100%',
      maxWidth: '800px',
      height: '900px',
    };
    const dialogRef = this.matDialog.open(ManageAppointmentComponent, data);

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((appointment) => {
      if (!appointment) return;

      const isDuplicate = this.appointments.some((a) =>
        this.isTimeOverlapping(a, {
          id: appointment.id,
          time: appointment.time,
          date: appointment.date,
          duration: appointment.duration,
          doctorId: appointment.doctor.id,
        }),
      );
      if (isDuplicate) {
        this.toastService.openToast(
          this.translocoService.translate('app-dialog.duplicate_time'),
          this.translocoService.translate('app-dialog.error'),
          'error',
        );
        return;
      }
      const index = this.appointments.findIndex((a) => a.id === appointment.id);
      if (index !== -1) {
        this.appointments[index] = appointment;
      } else {
        this.appointments.push(appointment);
      }
      this.sortAppointmentsByNearest();
    });
  }

  private isTimeOverlapping(
    existing: AppointmentModel,
    incoming: {
      id: number;
      time: string;
      date: string;
      duration: number;
      doctorId: number;
    },
  ): boolean {
    if (
      existing.id === incoming.id ||
      existing.doctor.id !== incoming.doctorId ||
      existing.date !== incoming.date
    ) {
      return false;
    }
    const existingStart = this.getMinutes(existing.time);
    const existingEnd = existingStart + (existing.duration || 30);
    const incomingStart = this.getMinutes(incoming.time);
    const incomingEnd = incomingStart + (incoming.duration || 30);

    return incomingStart < existingEnd && incomingEnd > existingStart;
  }

  private getMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  protected readonly AppointmentStatus = AppointmentStatus;

  public appointmentChanged(id: number, status: AppointmentStatus): void {
    this.appointments = this.appointments.map((appointment) => {
      if (appointment.id === id) {
        return {
          ...appointment,
          status,
        };
      }

      return appointment;
    });
  }

  openAppointmentDetails(appointment: AppointmentModel) {
    this.helper.openDetails(appointment);
  }

}


