import { Component, inject, input, output } from '@angular/core';
import { AppointmentModel } from '@models/appointment.model';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { TimeSlotClickPayload } from '@features/appointments/models/time-slot.model';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { Doctor } from '@features/doctor/models/doctor';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentsListModalComponent } from '@features/appointments/dialogs/appointments-list-modal/appointments-list-modal.component';
import { MatTooltip } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AppointmentDetailsComponent } from '@features/appointments/dialogs/appointment-details/appointment-details.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [
    LucideAngularModule,
    NgClass,
    SlicePipe,
    DatePipe,
    MatTooltip,
    CommonModule,
    TranslocoPipe
  ],
  templateUrl: './calendar-grid.component.html',
  styleUrls: ['./calendar-grid.component.scss'],
})
export class CalendarGridComponent {
  lang = '';

  constructor(private transloco: TranslocoService) {
  this.lang = this.transloco.getActiveLang();
  }

  appointments = input<AppointmentModel[]>([]);
  doctors = input<Doctor[]>([]);
  displayDays = input<Date[]>([]);
  timeSlots = input<string[]>([]);
  isWeekMode = input<boolean>(false);
  appointmentClick = output<AppointmentModel>();
  timeSlotClick = output<TimeSlotClickPayload>();
  clonedAppointment = output<Date>();

  Plus = Plus;
  private matDialog = inject(MatDialog);

  getAppointmentsForSlot(date: Date, time: string, doctorIndex: number) {
    const dateStr = date.toISOString().split('T')[0];
    const doctorId = this.doctors()[doctorIndex]?.id;

    return this.appointments().filter((apt) => {
      const matchesDate = dateStr === apt.date;
      const matchesTime = apt.time.slice(0, 2) === time.slice(0, 2);
      const matchesDoctor = this.isWeekMode()
        ? true
        : apt.doctor?.id === doctorId;
      return matchesDate && matchesTime && matchesDoctor;
    });
  }


  getAppointmentColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'bg-green-100 border-green-200 text-green-800';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 border-red-200 text-red-800';
      case AppointmentStatus.SCHEDULED:
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case AppointmentStatus.TEMPORARY:
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case AppointmentStatus.CANCELLED_FOREVER:
        return 'bg-pink-100 border-pink-200 text-pink-800';
      default:
        return 'bg-blue-100 border-blue-200 text-blue-800';
    }
  }
  
  isCurrentTime(time: string) {
    const now = new Date();
    const getHours = now.getHours().toString().padStart(2, '0');
    return time.slice(0, 2) === getHours;
  }

  addAppointment(
    date: Date,
    time: string,
    appointmentList: AppointmentModel[],
    doctor?: Doctor,
  ): void {
    if (!this.isWeekMode() && appointmentList.length > 0) {
      this.appointmentClick.emit(appointmentList[0]);
      return;
    }

    this.timeSlotClick.emit({
      date: date.toISOString(),
      time,
      appointmentList,
      ...(!this.isWeekMode() && { doctor }),
    });
  }

  onSlotClick(
    date: Date,
    time: string,
    appointments: any[],
    event: MouseEvent,
  ) {
    event.stopPropagation();
  }

  openAppointmentList(
    appointments: AppointmentModel[],
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.matDialog.open(AppointmentsListModalComponent, {
      data: appointments,
      panelClass: 'appointments-list-dialog',
    });
  }

  handleSlotClick(
    date: Date,
    time: string,
    appointmentsInSlot: any[],
    event: MouseEvent,
    doctor?: Doctor,
  ) {
    if (this.isWeekMode()) {
      this.addAppointment(date, time, appointmentsInSlot, doctor);
    } else {
      this.openAppointmentList(appointmentsInSlot, event);
    }
  }

  isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }


  openDetails(appointment: AppointmentModel) {
    this.matDialog.open(AppointmentDetailsComponent, {
        data: appointment,
        width: '100%',
        maxWidth: '900px',
        height: '900px',
    });
  }

  openList(appointment: AppointmentModel[]) {
    this.matDialog.open(AppointmentsListModalComponent, {
      data: appointment,
      position: {
      top: '0',              
      right: '0'            
    },
    });
  }


}
