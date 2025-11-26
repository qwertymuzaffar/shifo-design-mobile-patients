import {
  Component,
  computed,
  inject,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { AppointmentModel } from '@models/appointment.model';
import { first, map } from 'rxjs';
import { AppointmentsListModalComponent } from '@features/appointments/dialogs/appointments-list-modal/appointments-list-modal.component';
import { TimeSlotClickPayload } from '@features/appointments/models/time-slot.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ManageAppointmentComponent } from '@features/appointments/dialogs/manage-appointment/manage-appointment.component';
import { DoctorService } from '@core/services/doctor.service';
import { AppointmentService } from '@core/services/appointment.service';
import { CalendarHeaderComponent } from '@features/appointments/components/calendar-header/calendar-header.component';
import { CalendarGridComponent } from '@features/appointments/components/calendar-grid/calendar-grid.component';
import { CalendarLegendComponent } from '@features/appointments/components/calendar-legend/calendar-legend.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarDays, List, LucideAngularModule, Plus } from 'lucide-angular';
import { AppointmentListComponent } from '@features/appointments/components/appointment-list/appointment-list.component';
import { CloneAppointmentComponent } from '@features/appointments/dialogs/clone-appointment/clone-appointment.component';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { CalendarDayComponent } from '@features/appointments/components/calendar-day/calendar-day.component';
import { CalendarSkeletonComponent } from '@features/appointments/components/calendar-skeleton/calendar-skeleton.component';
import { UserService } from '@core/services/user.service';
import { UserRole } from '@core/models/user.model';
import { HelperService } from '@core/services/helper.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { Doctor } from '@features/doctor/models/doctor';
import { NgxPermissionsModule } from 'ngx-permissions';
import { BreakpointService } from '@core/services/breakpoint.service';
import { MobileAppointmentCardComponent } from '@features/appointments/components/mobile-appointment-card/mobile-appointment-card.component';
import { MobileAppointmentCardSkeletonComponent } from '@features/appointments/components/mobile-appointment-card-skeleton/mobile-appointment-card-skeleton.component';

function getISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

@Component({
  selector: 'app-appointments',
  imports: [
    TranslocoPipe,
    CommonModule,
    CalendarHeaderComponent,
    CalendarGridComponent,
    CalendarLegendComponent,
    LucideAngularModule,
    AppointmentListComponent,
    CalendarDayComponent,
    NgxPermissionsModule,
    MobileAppointmentCardComponent,
    MobileAppointmentCardSkeletonComponent,
    NgClass,
  ],
  templateUrl: './appointments.component.html',
  styleUrls: [`./appointments.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent {
  readonly appointmentService = inject(AppointmentService);
  private matDialog = inject(MatDialog);
  private userService = inject(UserService);
  private doctorService = inject(DoctorService);
  private breakpointService = inject(BreakpointService);
  readonly appointmentClick = output<AppointmentModel>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected readonly Plus = Plus;
  readonly CalendarDays = CalendarDays;
  readonly List = List;
  protected readonly userRole = UserRole;

  readonly isMobile = this.breakpointService.isMobile;
  currentDate = signal(new Date());
  viewMode = signal<'week' | 'day'>('day');
  isWeekMode = computed(() => this.viewMode() === 'week');
  showMode = signal<'calendar' | 'list'>('calendar');
  isShowCalendar = computed(() => {
    if (this.isMobile()) {
      return false;
    }
    return this.showMode() === 'calendar';
  });
  isShowList = computed(() => {
    if (this.isMobile()) {
      return true;
    }
    return this.showMode() === 'list';
  });
  showTabs = computed(() => !this.isMobile());
  showAddButton = computed(() => !this.isMobile());
  isLoadingAppointments = computed(() => this.appointments.isLoading());
  userInfo = this.userService.getUserInfoFromStorage();
  constructor(
    private helper: HelperService,
    private dialog: MatDialog,
  ) {
    this.router.navigate([], {
      queryParams: {},
      skipLocationChange: false,
    });
  }

  doctorIds = toSignal(
    this.route.queryParams.pipe(map((params) => params['doctorIds'])),
  );

  patientId = toSignal(
    this.route.queryParams.pipe(map((params) => params['patientId'])),
  );

  search = toSignal(
    this.route.queryParams.pipe(map((params) => params['search'])),
  );

  status = toSignal(
    this.route.queryParams.pipe(map((params) => params['status'])),
  );

  isShowClearFilter = computed(() => !!this.doctorIds() || !!this.patientId());

  doctorList = rxResource({
    stream: () => {
      const isUserDoctor = this.userInfo.role.toUpperCase() === UserRole.DOCTOR;

      return this.doctorService.getDoctors({ limit: 100 }).pipe(
        map((response) => {
          if (isUserDoctor) {
            response.items = response.items.filter(
              (doctor) => doctor.user.id === this.userInfo.id,
            );
          }

          return response.items;
        }),
      );
    },
    defaultValue: [],
  });

  sortedAppointments = computed(() =>
    this.appointments.value().sort((a, b) => a.time.localeCompare(b.time)),
  );

  public appointments = rxResource({
    params: () => ({
      doctorIds: this.doctorIds(),
      patientId: this.patientId(),
      ...this.displayDaysDate(),
      search: this.search(),
      status: this.status(),
    }),
    stream: ({ params }) => {
      let { dateFrom, dateTo, doctorIds, patientId, search, status } = params;
      const isUserDoctor = this.userInfo.role.toUpperCase() === UserRole.DOCTOR;

      if (isUserDoctor) {
        const doctor = this.doctorList.value()[0];
        doctorIds = doctor?.id;
      }

      return this.appointmentService.getAppointments({
        ...(doctorIds && { doctorIds }),
        ...(patientId && { patientId }),
        ...(search && { search }),
        ...(status && status !== 'ALL' && { status }),
        dateFrom,
        dateTo,
      });
    },
    defaultValue: [],
  });

  createAppointment(appointment?: AppointmentModel, doctor?: Doctor) {
    const now = new Date();

    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(':').slice(0, 2).join(':');

    const dialogRef = this.dialog.open(ManageAppointmentComponent, {
      width: '800px',
      maxWidth: '800px',
      data: {
        appointment: appointment || null,
        doctor: doctor || null,
        date: appointment?.date || currentDate,
        time: appointment?.time || currentTime,
        patientId: appointment?.patient.id || null,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appointments.reload();
      }
    });
  }

  onAppointmentClick(appointment: AppointmentModel): void {
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      this.openAppointmentDetails(appointment);
      return;
    }

    const doctorId = appointment?.doctor.id;
    const date = appointment?.date.split('T')[0];

    const appointmentsArray = this.appointments.value() ?? [];

    const appointmentsForDoctorAndDate = appointmentsArray.filter(
      (app) => app.doctor.id === doctorId && app.date.split('T')[0] === date,
    );

    this.matDialog
      .open(ManageAppointmentComponent, {
        data: { appointment, appointments: appointmentsForDoctorAndDate },
        width: '100%',
        maxWidth: '900px',
        height: '90vh',
      })
      .afterClosed()
      .pipe(first())
      .subscribe(() => {
        this.appointments.reload();
      });
  }

  timeSlotClick(event: TimeSlotClickPayload): void {
    const hasAppointments = event.appointmentList.length > 0;

    const dialogConfig: MatDialogConfig = hasAppointments
      ? {
          data: event.appointmentList,
          height: '100%',
          minHeight: '100%',
          position: {
            right: '0',
          },
          panelClass: 'appointments-list-dialog',
        }
      : {
          data: {
            date: event.date,
            time: event.time,
            doctor: event.doctor,
          },
          width: '100%',
          maxWidth: '800px',
          height: '900px',
        };

    const dialogComponent: any = hasAppointments
      ? AppointmentsListModalComponent
      : ManageAppointmentComponent;

    this.matDialog
      .open(dialogComponent, dialogConfig)
      .afterClosed()
      .pipe(first())
      .subscribe(() => this.appointments.reload());
  }

  timeSlots = computed(() => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        slots.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        );
      }
    }
    return slots;
  });

  weekDays = computed(() => {
    const startOfWeek = new Date(this.currentDate());
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  });

  displayDays = computed(() =>
    this.isWeekMode()
      ? this.weekDays()
      : this.doctorList.value().map(() => this.currentDate()),
  );

  displayDaysDate = computed(() => {
    return this.isWeekMode()
      ? {
          dateFrom: getISODate(this.weekDays()[0]),
          dateTo: getISODate(this.weekDays()[6]),
        }
      : {
          dateFrom: getISODate(this.currentDate()),
          dateTo: getISODate(this.currentDate()),
        };
  });

  navigateCalendar(direction: 'prev' | 'next') {
    const newDate = new Date(this.currentDate());
    if (this.viewMode() === 'week') {
      newDate.setDate(
        this.currentDate().getDate() + (direction === 'next' ? 7 : -7),
      );
    } else {
      newDate.setDate(
        this.currentDate().getDate() + (direction === 'next' ? 1 : -1),
      );
    }
    this.currentDate.set(newDate);
  }

  setCurrentDate() {
    this.currentDate.set(new Date());
  }

  setViewMode(mode: 'week' | 'day') {
    this.viewMode.set(mode);
  }

  public editAppointment(appointment: AppointmentModel): void {
    this.matDialog
      .open(ManageAppointmentComponent, {
        data: { appointment },
        width: '100%',
        maxWidth: '900px',
        height: '90vh',
      })
      .afterClosed()
      .pipe(first())
      .subscribe(() => this.appointments.reload());
  }

  public async filterChanged({
    search,
    status,
  }: Partial<{ search: string | null; status: string | null }>) {
    await this.router.navigate([], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        search,
        status,
      },
    });
  }

  public clonedAppointment(date: Date): void {
    const dialogRef = this.matDialog.open(CloneAppointmentComponent, {
      data: date,
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((isReload) => {
        if (isReload) {
          this.appointments.reload();
        }
      });
  }

  openAppointmentDetails(appointment: AppointmentModel) {
    this.helper.openDetails(appointment);
  }
}
