import { Component, computed, inject, OnInit, signal } from '@angular/core';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AddDoctorComponent } from '@features/doctor/dialogs/add-doctor/add-doctor.component';
import { Pagination } from '@models/pagination.model';
import {
  Clock,
  Copy,
  LucideAngularModule,
  Phone,
  SquarePen,
  Trash2,
  Settings,
  Plus,
  X,
  Wallet,
  Award,
} from 'lucide-angular';
import { DoctorService } from '@core/services/doctor.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, first, startWith, switchMap } from 'rxjs';
import { Doctor } from '@features/doctor/models/doctor';
import { ToastService } from '@core/services/toast.service';
import { PaginationComponent } from '@shared/components';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import {
  rxResource,
  takeUntilDestroyed,
  toObservable,
} from '@angular/core/rxjs-interop';
import { SpecializationService } from '@core/services/specialization.service';
import { WithQueryParams } from '@core/router/with-query-params';
import { PhoneFormatPipe } from '@core/pipes/phone-format.pipe';
import { AppointmentService } from '@core/services/appointment.service';
import { ActivatedRoute } from '@angular/router';
import { DoctorSkeletonComponent } from '@features/doctor/skeleton/doctor-skeleton.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {NgxPermissionsModule } from 'ngx-permissions';
import {UserRole} from "@core/models/user.model";
import { BreakpointService } from '@core/services/breakpoint.service';

@Component({
  selector: 'app-doctor',
  imports: [
    TranslocoPipe,
    FormsModule,
    LucideAngularModule,
    PaginationComponent,
    ReactiveFormsModule,
    CdkCopyToClipboard,
    PhoneFormatPipe,
    DoctorSkeletonComponent,
    NgxPermissionsModule,
  ],
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss'],
})
export class DoctorComponent extends WithQueryParams implements OnInit {
  lang = '';
  newSpecializationName: string = '';

  constructor(private transloco: TranslocoService) {
    super();
  }

  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private doctorService = inject(DoctorService);
  private activatedRoute = inject(ActivatedRoute);
  protected readonly Phone = Phone;
  protected readonly Copy = Copy;
  protected readonly SquarePen = SquarePen;
  protected readonly Clock = Clock;
  protected readonly Trash2 = Trash2;
  protected readonly X = X;
  protected readonly Plus = Plus;
  protected readonly Settings = Settings;
  protected readonly Wallet = Wallet;
  protected readonly Award = Award;
  readonly isLoading = signal<boolean>(true);
  private specializationService = inject(SpecializationService);
  readonly appointmentService = inject(AppointmentService);
  readonly breakpointService = inject(BreakpointService);

  isSpecializationManagementVisible = signal<boolean>(false);
  showAllSpecializations = signal(false);

  public data = signal<Pagination<Doctor>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  public form = new FormGroup({
    search: new FormControl<string>('', { nonNullable: true }),
    page: new FormControl<number>(1, { nonNullable: true }),
    limit: new FormControl<number>(10, { nonNullable: true }),
    specializationId: new FormControl<number>(0, { nonNullable: true }),
  });

  private refreshSpecializationsTrigger = signal(0);
  private refreshSpecializations$ = toObservable(
    this.refreshSpecializationsTrigger,
  );

  specializations = rxResource({
    stream: () =>
      this.refreshSpecializations$.pipe(
        switchMap(() => this.specializationService.getSpecializations()),
      ),
    defaultValue: [],
  });

  visibleSpecializations = computed(() => {
    const allSpecs = this.specializations.value();
    if (this.showAllSpecializations() || allSpecs.length <= 12) {
      return allSpecs;
    }
    return allSpecs.slice(0, 12);
  });

  ngOnInit() {
    this.syncQueryParams();
    const page = Number(this.activatedRoute.snapshot.queryParams['page']) || 1;
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
    let prevSearchTerm = '';

    this.form.valueChanges
      .pipe(
        startWith(this.form.getRawValue()),
        debounceTime(300),
        switchMap(({ specializationId, ...rest }) => {
          this.isLoading.set(true);
          const query = { ...rest } as Record<string, number | string>;

          if (specializationId && +specializationId) {
            query['specializationId'] = specializationId;
          }

          if (rest.search !== prevSearchTerm) {
            query['page'] = 1;
            this.form.get('page')?.patchValue(1, { emitEvent: false });
          }

          return this.doctorService.getDoctors(query);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.isLoading.set(false);
        prevSearchTerm = this.form.get('search')?.value as string;
        this.data.set(data);
      });
  }

  public deleteDoctor(doctorId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: this.transloco.translate('doctor.confirm_delete'),
        action: () => this.doctorService.deleteDoctor(doctorId),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (result) => {
          if (result) {
            this.form.reset();
            this.toastService.openToast(
              this.transloco.translate('doctor.deleted'),
              this.transloco.translate('doctor.delete_success'),
            );
          }
        },
        error: (error) => {
          this.toastService.openToast(
            this.transloco.translate('doctor.delete_error'),
            this.transloco.translate('doctor.error'),
            'error',
          );
          console.error(this.transloco.translate('doctor.delete_error'), error);
        },
      });
  }

  public openDialog(doctor?: Doctor, isViewMode = false): void {
    const dialogRef = this.dialog.open(AddDoctorComponent, {
      width: '600px',
      data: {
        doctor: doctor,
        isViewMode: isViewMode,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((newDoctor: Doctor | undefined) => {
        if (newDoctor && !isViewMode) {
          this.form.reset();
        }
      });
  }

  public pageChange(page: number): void {
    this.form.patchValue({ page });
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        limit: this.form.get('limit')?.value,
        page,
      },
    });
  }

  public toast() {
    if (this.lang == 'ru') {
      this.toastService.openToast(this.transloco.translate('doctor.copiled'));
    } else {
      this.toastService.openToast(this.transloco.translate('doctor.copiled'));
    }
  }

  clearFilter(): void {
    this.form.patchValue({ specializationId: 0, search: '' });
  }
  public limitChange(limit: number): void {
    this.form.patchValue({ limit, page: 1 });
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        limit,
        page: 1,
      },
    });
  }

  onLimitChange(selectElement: HTMLSelectElement) {
    const newLimit = Number(selectElement.value);
    selectElement.blur();
  }

  createSpecialization(): void {
    if (!this.newSpecializationName.trim()) {
      this.toastService.openToast(
        this.transloco.translate(
          'manage-doctors.empty_specialization_name_error',
        ),
        this.transloco.translate('manage-doctors.create_specialization_error'),
      );
      return;
    }

    this.specializationService
      .createSpecialization(this.newSpecializationName)
      .pipe(first())
      .subscribe({
        next: () => {
          this.refreshSpecializationsTrigger.update((v) => v + 1);
          this.toastService.openToast(
            this.transloco.translate(
              'manage-doctors.specialization_added_successfully',
            ),
          );
          this.newSpecializationName = '';
        },
        error: (error) => {
          console.error('Error creating specialization:', error);
          this.toastService.openToast(
            this.transloco.translate(
              'manage-doctors.create_specialization_error',
            ),
          );
        },
      });
  }

  deleteSpecialization(specId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: this.transloco.translate(
          'manage-doctors.confirm_delete_specialization',
        ),
        action: () => this.specializationService.deleteSpecialization(specId),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (result) => {
          if (result) {
            this.refreshSpecializationsTrigger.update((v) => v + 1);

            if (this.form.controls.specializationId.value === specId) {
              this.clearFilter();
            }

            this.toastService.openToast(
              this.transloco.translate(
                'manage-doctors.specialization_deleted_successfully',
              ),
            );
          }
        },
        error: (error) => {
          console.error('Error deleting specialization:', error);
          this.toastService.openToast(
            this.transloco.translate(
              'manage-doctors.delete_specialization_error',
            ),
          );
        },
      });
  }

  protected readonly userRole = UserRole;
}
