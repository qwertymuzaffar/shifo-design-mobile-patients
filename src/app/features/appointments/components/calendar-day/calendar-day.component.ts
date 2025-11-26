import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AppointmentModel } from '@models/appointment.model';
import { Doctor } from '@features/doctor/models/doctor';
import { NgClass, NgStyle } from '@angular/common';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { TimeSlotClickPayload } from '@features/appointments/models/time-slot.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HelperService } from '@core/services/helper.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-calendar-day',
  imports: [
    TranslocoPipe,
    NgStyle,
    LucideAngularModule,
    NgClass,
    MatTooltipModule,
  ],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss',
})
export class CalendarDayComponent {
  constructor(private helper: HelperService) {
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 30 * 1000);
  }

  timeSlotClick = output<TimeSlotClickPayload>();
  reload = output<void>();
  appointments = input<AppointmentModel[]>([]);
  doctors = input<Doctor[]>([]);
  displayDays = input<Date[]>([]);
  timeSlots = input<string[]>([]);

  private route = inject(ActivatedRoute);

  doctorIds = toSignal<string | undefined>(
    this.route.queryParams.pipe(map((params) => params['doctorIds'])),
  );

  currentTime = signal(new Date());

  doctorList = computed(() => {
    const doctors = this.doctors() ?? [];
    const doctorIds = this.doctorIds()?.split(',') ?? null;

    const filtered = doctorIds
      ? doctors.filter(d => doctorIds.includes(String(d.id)))
      : doctors;

    return filtered.sort((a, b) => {
      const fnA = a.firstName.toLowerCase();
      const fnB = b.firstName.toLowerCase();
      const lnA = a.lastName.toLowerCase();
      const lnB = b.lastName.toLowerCase();

      return fnA.localeCompare(fnB) || lnA.localeCompare(lnB);
    });
  });

  readonly timetableData = computed(() => {
    return this.doctorList().map((doctor) => ({
      doctor,
      slots: this.timeSlots().map((time) => ({
        time,
        isCurrentSlot: this.isCurrentTime(time),
        appointments: this.getAppointmentsForSlot(time, doctor.id),
      })),
    }));
  });

  gridTemplateColumns = computed(
    () => `repeat(${this.timeSlots().length + 2}, minmax(120px, 1fr))`
  );

  protected readonly Plus = Plus;

  getAppointmentsForSlot(time: string, doctorId: number) {
    return this.appointments().filter((apt) => {
      const matchesTime = apt.time.slice(0, 2) === time.slice(0, 2);
      const matchesDoctor = apt.doctor?.id === doctorId;
      return matchesTime && matchesDoctor;
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

  currentDate = computed(() => {
    if (!this.displayDays().length) {
      return '';
    }
    const firstDay = this.displayDays()[0];
    return firstDay ? firstDay.toISOString().split('T')[0] : '';
  });

  isCurrentTime(time: string): boolean {
    const now = this.currentTime();
    const currentDate = now.toISOString().split('T')[0];
    const [hourStr] = time.split(':');
    const timeHour = Number(hourStr);
    return timeHour === now.getHours() && currentDate === this.currentDate();
  }

  timeSlotClicked(param: { time: string; doctor: Doctor; appointments: AppointmentModel[] }): void {
    this.timeSlotClick.emit({
      time: param.time,
      doctor: param.doctor,
      date: this.displayDays()[0].toISOString().split('T')[0],
      appointmentList: param.appointments,
    });
  }

  openAppointmentDetails(appointment: AppointmentModel) {
    this.helper.openDetails(appointment)
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.reload.emit();
        }
      });
  }

  getSortedAppointments(slot: any) {
    return slot.appointments.sort((a: any, b: any) => a.time.localeCompare(b.time));
  }
}
