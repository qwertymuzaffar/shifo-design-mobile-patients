import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { AppointmentModel } from '@models/appointment.model';
import { StatusTranslatePipe } from '@core/pipes/translate.pipe';
import {
  LucideAngularModule,
  LucideCheckCircle,
  LucideClock,
  LucideEdit,
  LucideXCircle,
  LucideAlertCircle,
  LucideBan,
} from 'lucide-angular';
import { MatTooltip } from '@angular/material/tooltip';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompleteButtonComponent } from '@features/appointments/components/complete-button/complete-button.component';
import { CancelButtonComponent } from '@features/appointments/components/cancel-button/cancel-button.component';
import { TypeTranslatePipe } from '@core/pipes/type-translate.pipe';
import { DuplicateButtonComponent } from '@features/appointments/components/duplicate-button/duplicate-button.component';
import { HelperService } from '@core/services/helper.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';


@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    TranslocoPipe,
    NgClass,
    DatePipe,
    StatusTranslatePipe,
    SlicePipe,
    LucideAngularModule,
    MatTooltip,
    ReactiveFormsModule,
    CompleteButtonComponent,
    CancelButtonComponent,
    TypeTranslatePipe,
    DuplicateButtonComponent,
    NgxPermissionsModule
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss',
})
export class AppointmentListComponent implements OnInit {
  constructor(private helper: HelperService) {}

  readonly appointments = input<AppointmentModel[]>([]);

  readonly edit = output<AppointmentModel>();

  filterChanged =
    output<Partial<{ search: string | null; status: string | null }>>();
  status = signal<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  readonly reload = output<void>();

  readonly filterForm = new FormGroup({
    search: new FormControl<string>(''),
    status: new FormControl<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>(
      'ALL',
    ),
  });

  protected readonly CheckCircle = LucideCheckCircle;
  protected readonly XCircle = LucideXCircle;
  protected readonly Edit = LucideEdit;
  protected readonly Clock = LucideClock;
  protected readonly AlertCircle = LucideAlertCircle;
  protected readonly Ban = LucideBan;
  protected readonly userRole = UserRole;

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.filterChanged.emit(value);
      });
  }

  openAppointmentDetails(appointment: AppointmentModel) {
    this.helper.openDetails(appointment);
  }

  getStatusIcon(status: string) {
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
