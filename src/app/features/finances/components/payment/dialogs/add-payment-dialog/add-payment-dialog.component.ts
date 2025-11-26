import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormFieldComponent } from '@shared/controls';
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { PatientService } from '@features/patients/services/patient.service';
import { Pagination } from '@models/pagination.model';
import { PatientModel } from '@features/patients/models/patient.model';
import { debounceTime, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OptionsScrollDirective } from '@shared/directives/option-scroll/options-scroll.directive';
import { AppointmentService } from '@core/services/appointment.service';
import { AppointmentModel } from '@models/appointment.model';
import { PaymentService } from '@core/services/payment.service';
import {
  PaymentMethodType,
  PaymentStatusEnum,
  PaymentType,
} from '@core/models/payment.model';
import { ToastService } from '@core/services/toast.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-add-payment-dialog',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    FormFieldComponent,
    MatAutocomplete,
    MatAutocompleteModule,
    CommonModule,
    OptionsScrollDirective,
  ],
  templateUrl: './add-payment-dialog.component.html',
  styleUrl: './add-payment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentDialogComponent implements OnInit {
  constructor(private transloco: TranslocoService) {}

  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private toastService = inject(ToastService);
  private paymentService = inject(PaymentService);
  private destroyRef = inject(DestroyRef);
  private currentPage = 1;
  private matDialogRef = inject(MatDialogRef<AddPaymentDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);

  readonly loadingPatients = signal(false);
  isLoading = signal(false);
  paymentType = PaymentType;
  paymentMethod = PaymentMethodType;
  paymentStatus = PaymentStatusEnum;

  paymentTypeSelected = signal(PaymentType.Payment);
  paymentMethodSelected = signal(PaymentMethodType.CASH);
  paymentStatusSelected = signal(PaymentStatusEnum.PENDING);
  searchText = '';

  form = new FormGroup({
    patientId: new FormControl(),
    amount: new FormControl('', Validators.required),
    paymentKind: new FormControl(PaymentType.Payment, Validators.required),
    appointmentId: new FormControl('', Validators.required),
    comment: new FormControl(),
  });

  patientPagination = signal<Pagination<PatientModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  patientAppointments = signal<AppointmentModel[]>([]);
  patientControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.patientControl.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchText = value || '';
        this.loadPatients(true);
      });

    this.loadPatients();
    this.form
      .get('patientId')
      ?.valueChanges.pipe(
        switchMap((patientId) => {
          return this.appointmentService.getAppointments({ patientId });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.patientAppointments.set(res);
      });

    this.form
      .get('paymentKind')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((kind) => {
        const appointmentControl = this.form.get('appointmentId');

        if (kind === PaymentType.Prepayment) {
          appointmentControl?.clearValidators();
          appointmentControl?.setValue(null);
        } else {
          appointmentControl?.setValidators(Validators.required);
        }
        appointmentControl?.updateValueAndValidity();
      });
  }

  loadPatients(reset = false) {
    if (this.loadingPatients()) return;
    if (reset) {
      this.currentPage = 1;
      this.patientPagination.set({
        items: [],
        total: 0,
        page: 1,
        limit: this.patientPagination().limit,
        totalPages: 0,
      });
    }
    const limit = this.patientPagination().limit;
    const pagination = this.patientPagination();
    if (pagination.total > 0 && pagination.items.length >= pagination.total) {
      return;
    }

    this.loadingPatients.set(true);
    this.patientService
      .getPatients({
        search: this.searchText,
        page: this.currentPage,

        limit,
      })
      .pipe(
        finalize(() => this.loadingPatients.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.patientPagination.update((curr) => ({
          ...curr,
          items: [...curr.items, ...res.items],
          total: res.total,
          totalPages: res.totalPages,
          page: this.currentPage,
        }));
        this.currentPage++;
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { appointmentId, amount, paymentKind, patientId } =
      this.form.getRawValue();
    const payload = {
      amount,
      patientId: Number(patientId),
      appointmentId: appointmentId ? Number(appointmentId) : null,
      paymentType: this.paymentMethodSelected(),
      paymentKind,
      status: this.paymentStatusSelected(),
    };

    this.paymentService
      .createPayment(payload)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toastService.openToast(
            this.transloco.translate('app-dialog.success'),
            this.transloco.translate('pay.success'),
          );
          this.data.onSuccess();
          this.onClose();
        },
        error: (err) => {
          const message =
            err.error?.error?.message ||
            this.transloco.translate('app-dialog.import_error');
          this.toastService.openToast(
            message,
            this.transloco.translate('pay.error'),
            'error',
          );
        },
      });
  }

  onClose() {
    this.matDialogRef.close();
  }
}
