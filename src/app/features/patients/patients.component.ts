import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';

import {FormControl, FormGroup, FormsModule, ReactiveFormsModule,} from '@angular/forms';
import { AddPatientComponent } from '@features/patients/dialogs/add-patient/add-patient.component';
import { PatientService } from '@features/patients/services/patient.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, first, startWith, switchMap } from 'rxjs';
import { PatientModel } from '@features/patients/models/patient.model';
import { PaginationComponent } from '../../shared';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {Copy, LucideAngularModule, Phone, SquarePen, Trash2} from "lucide-angular";
import {Pagination} from "@models/pagination.model";
import {CdkCopyToClipboard} from "@angular/cdk/clipboard";
import {ToastService} from "@core/services/toast.service";
import {ConfirmDialogComponent} from "@shared/confirm-dialog/confirm-dialog.component";
import {PhoneFormatPipe} from "@core/pipes/phone-format.pipe";
import {SkeletonPatientComponent} from "@features/patients/skeleton/skeleton-patient.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { WithQueryParams } from '@core/router/with-query-params';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';
import { BreakpointService } from '@core/services/breakpoint.service';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';

@Component({
  selector: 'app-patients',
  imports: [
    TranslocoPipe,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent,
    CdkCopyToClipboard,
    LucideAngularModule,
    PhoneFormatPipe,
    SkeletonPatientComponent,
    RouterLink,
    NgxPermissionsModule,
    MobileHeaderComponent,
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
})
export class PatientsComponent extends WithQueryParams implements OnInit {
  constructor(private trans: TranslocoService) {
    super();
  }

  readonly isLoading = signal<boolean>(true);
  private patientService = inject(PatientService);
  private dialog = inject(MatDialog);
  private activatedRoute = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  protected readonly breakpointService = inject(BreakpointService);
  protected readonly Copy = Copy;
  protected readonly Phone = Phone;
  protected readonly SquarePen = SquarePen;
  protected readonly Trash2 = Trash2;

  form = new FormGroup({
    search: new FormControl<string>(''),
    page: new FormControl<number>(1),
    limit: new FormControl<number>(10),
  });

  data = signal<Pagination<PatientModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  ngOnInit(): void {
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
        switchMap(({ search, limit, page }) => {
          this.isLoading.set(true);

          if (search !== prevSearchTerm) {
            page = 1;
            this.form.get('page')?.patchValue(1, { emitEvent: false });
          }

          return this.patientService.getPatients({ search, page, limit });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.isLoading.set(false);
        prevSearchTerm = this.form.get('search')?.value as string;
        this.data.set(data);
      });
  }

  deletePatient(patientId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: this.trans.translate('patient.confirm_delete'),
        action: () => this.patientService.deletePatients(patientId),
      },
    });
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (result) => {
          if (result) {
            this.form.patchValue(this.form.value);
            this.toastService.openToast(
              this.trans.translate('patient.deleted'),
              this.trans.translate('patient.delete_success'),
            );
          }
        },
        error: (error) => {
          this.toastService.openToast(
            this.trans.translate('patient.delete_error'),
            this.trans.translate('app-dialog.error'),
            'error',
          );
          console.error(this.trans.translate('patient.delete_error'), error);
        },
      });
  }

  public openDialog(patient?: PatientModel, isViewMode = false): void {
    const dialogRef = this.dialog.open(AddPatientComponent, {
      width: '600px',
      data: {
        patient,
        isViewMode: isViewMode,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((newPatient: PatientModel | undefined) => {
        if (newPatient && !isViewMode) {
          this.form.patchValue(this.form.value);
        }
      });
  }

  public pageChange(page: number): void {
    this.form.patchValue({ page });
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        page,
      },
    });
  }

  public toast() {
    this.toastService.openToast(this.trans.translate('patient.copied'));
  }

  clearFilter(): void {
    this.form.patchValue({ search: '' });
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

  protected readonly userRole = UserRole;

}
