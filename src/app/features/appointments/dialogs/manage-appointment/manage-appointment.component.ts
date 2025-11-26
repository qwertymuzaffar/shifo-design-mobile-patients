import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AppointmentUpsertModel,
  AppointmentModel,
  AppointmentType,
} from '@models/appointment.model';
import { LucideAngularModule, Plus, X } from 'lucide-angular';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, first, of, startWith } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { DoctorService } from '@core/services/doctor.service';
import { PatientService } from '@features/patients/services/patient.service';
import { AppointmentService } from '@core/services/appointment.service';
import { ToastService } from '@core/services/toast.service';
import { PaymentService } from '@core/services/payment.service';
import { PaymentMethodType } from '@core/models/payment.model';
import { ProcedureService } from '@core/services/procedure.service';
import { ProcedureRes } from '@core/models/procedure.models';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { FormFieldComponent } from '@shared/controls';
import { PatientModel } from '@features/patients/models/patient.model';
import { Pagination } from '@models/pagination.model';
import { Doctor } from '@features/doctor/models/doctor';
import { OptionsScrollDirective } from '@shared/directives/option-scroll/options-scroll.directive';
import { timeRangeValidator } from '@core/validators/time-range';
import { duplicateDateValidator } from '@features/appointments/dialogs/manage-appointment/duplicate.validation';
import { DatePipe } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';


interface DataInterface {
  appointment: AppointmentModel;
  date: string;
  time: string;
  patientId: number;
  doctor?: Doctor;
  appointments?: AppointmentModel[];
}

@Component({
  selector: 'app-manage-appointment',
  templateUrl: './manage-appointment.component.html',
  styleUrl: './manage-appointment.component.scss',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    MatDialogClose,
    LucideAngularModule,
    MatAutocomplete,
    FormFieldComponent,
    MatAutocompleteTrigger,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatOption,
    OptionsScrollDirective,
    DatePipe,
  ],
})
export class ManageAppointmentComponent implements OnInit {
  constructor(private translocoService: TranslocoService){}
  public appointmentForm = new FormGroup({
    patientId: new FormControl<any>(null, [Validators.required]),
    doctorId: new FormControl<number | null>(null, [Validators.required]),
    type: new FormControl(AppointmentType.CONSULTATION, [Validators.required]),
    paymentType: new FormControl(PaymentMethodType.CASH, [Validators.required]),
    duration: new FormControl(30),
    status: new FormControl(AppointmentStatus.SCHEDULED),
    symptoms: new FormControl(''),
    prescription: new FormControl(''),
    notes: new FormControl(''),
    procedure: new FormControl(''),
    datetimes: new FormArray([], [duplicateDateValidator()]),
  });

  get dateTimes() {
    return this.appointmentForm.get('datetimes') as FormArray;
  }

  private dateTimesGroup(
    date: string | null = null,
    time: string | null = null,
  ) {
    return new FormGroup({
      date: new FormControl<string | null>(date, [Validators.required]),
      time: new FormControl<string | null>(time, [
        Validators.required,
        timeRangeValidator('08:00', '18:00'),
      ]),
    });
  }

  public getControl(index: number, key: string) {
    return (this.dateTimes.at(index) as FormGroup).controls[key];
  }

  readonly paymentType = PaymentMethodType;
  readonly appointmentStatus = AppointmentStatus;
  readonly suggestedSlot = signal<string[]>([
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ]);
  readonly X = X;
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);
  private appointmentService = inject(AppointmentService);
  private toastService = inject(ToastService);
  private dialogRef = inject(MatDialogRef);
  private paymentService = inject(PaymentService);
  private procedureService = inject(ProcedureService);
  readonly data: DataInterface = inject(MAT_DIALOG_DATA);
  readonly procedure = signal<ProcedureRes[]>([]);
  readonly isSubmitting = signal(false);
  readonly search = signal<string>('');
  readonly isTemporary = signal(false);
  private destroyRef = inject(DestroyRef);

  patientControl = new FormControl('', [Validators.required]);
  doctorControl = new FormControl('', [Validators.required]);

  limit = 10;
  searchText = '';
  private currentPage = 1;
  readonly loadingPatients = signal(false);
  patientPagination = signal<Pagination<PatientModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  doctorPagination = signal<Pagination<Doctor>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  readonly loadingDoctors = signal(false);
  searchDoctorText = '';
  private currentDoctorPage = 1;
  isPatientSelected = false;

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

  loadDoctors(reset = false) {
    if (this.loadingDoctors()) return;

    if (reset) {
      this.currentDoctorPage = 1;
      this.doctorPagination.set({
        items: [],
        total: 0,
        page: 1,
        limit: this.doctorPagination().limit,
        totalPages: 0,
      });
    }
    const limit = this.doctorPagination().limit;
    const pagination = this.doctorPagination();

    if (pagination.total > 0 && pagination.items.length >= pagination.total) {
      return;
    }

    this.loadingDoctors.set(true);

    this.doctorService
      .getDoctors({
        search: this.searchDoctorText,
        page: this.currentDoctorPage,

        limit,
      })
      .pipe(
        finalize(() => this.loadingDoctors.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.doctorPagination.update((curr) => ({
          ...curr,
          items: [...curr.items, ...res.items],
          total: res.total,
          totalPages: res.totalPages,
          page: this.currentDoctorPage,
        }));
        this.currentDoctorPage++;
      });
  }

  get isEditing() {
    return !!this.data?.appointment;
  }

  get suggestedSlots(): string[] {
    return this.suggestedSlot();
  }

  readonly payment = rxResource({
    stream: () => {
      return this.data?.appointment &&
        this.data?.appointment?.status === AppointmentStatus.COMPLETED
        ? this.paymentService.getPayment(this.data.appointment.id)
        : of(null);
    },
  });

  ngOnInit(): void {
    this.procedureService
      .getProcedure()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.procedure.set(res);
        },
      });

    if (this.data?.time && this.data?.date) {
      this.dateTimes.push(
        this.dateTimesGroup(this.data.date.split('T')[0], this.data.time),
      );
    }

    if (this.data?.doctor) {
      this.appointmentForm.patchValue({
        doctorId: this.data.doctor.id,
      });
      this.doctorControl.setValue(
        this.data.doctor.firstName + ' ' + this.data.doctor.lastName,
      );
      this.doctorControl.disable();
    }

    if (this.data?.appointment) {
      this.dateTimes.clear();
      this.dateTimes.push(
        this.dateTimesGroup(
          this.data.appointment.date,
          this.data.appointment.time,
        ),
      );
      this.appointmentForm.patchValue({
        ...this.data.appointment,
        doctorId: this.data.appointment.doctor.id,
      });

      this.patientControl.setValue(
        this.data.appointment.patient.fullName || '',
      );

      this.doctorControl.setValue(
        this.data.appointment.doctor.firstName +
          ' ' +
          this.data.appointment.doctor.lastName || '',
      );
    }
    this.loadPatients(true);
    this.patientControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.searchText = value || '';
        if (this.isPatientSelected) {
          this.isPatientSelected = false;
          return;
        }
        if (this.appointmentForm.get('patientId')?.value) {
          this.appointmentForm.get('patientId')?.setValue(null);
        }
        this.loadPatients(true);
      });

    this.loadDoctors(true);
    this.doctorControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.searchDoctorText = value || '';
        this.loadDoctors(true);
      });

      const appointmentTypeControl = this.appointmentForm.get("type")
      const patientControl = this.appointmentForm.get("patientId")

      appointmentTypeControl?.valueChanges
       .pipe(
        startWith(appointmentTypeControl?.value)
       )
       .subscribe((value) => {
        const isRemovePatientFieldValidator = value && [AppointmentType.CONSULTATION, AppointmentType.EMERGENCY].includes(value);

          if(isRemovePatientFieldValidator) {
            patientControl?.removeValidators([Validators.required])
            this.patientControl?.removeValidators([Validators.required])
            this.patientControl.setErrors(null)
          } else {
            patientControl?.addValidators([Validators.required])
            this.patientControl?.addValidators([Validators.required])
          }

       })
  }

  selectPatient(patient: PatientModel) {
    this.isPatientSelected = true;
    this.appointmentForm.controls['patientId'].setValue(patient.id);
    this.patientControl.setValue(patient.fullName);
  }

  selectDoctor(doctor: Doctor) {
    this.appointmentForm.controls['doctorId'].setValue(doctor.id);
    this.doctorControl.setValue(`${doctor.firstName} ${doctor.lastName}`);
  }

  handleTimeChange(time: string): void {
    for (let i = 0; i < this.dateTimes.length; i++) {
      this.dateTimes.at(i).patchValue({
        time,
      });
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid || this.patientControl.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.patientControl.markAsTouched();
      return;
    }

    if (!this.appointmentForm.get('patientId')?.value && this.patientControl.value) {
      this.toastService.openToast('Этот пациент не найден. Сначала создайте его в разделе Пациенты.', 'Ошибка', 'error');
      return;
    }

    let formData = {
      ...this.appointmentForm.getRawValue(),
      duration: Number(this.appointmentForm.value.duration),
    } as AppointmentUpsertModel;

    if (!this.isEditing) {
      formData.status = this.isTemporary() ? AppointmentStatus.TEMPORARY : AppointmentStatus.SCHEDULED;
    }

    if (this.isEditing) {
      formData = {
        ...formData,
        date: this.dateTimes.at(0).value.date,
        time: this.dateTimes.at(0).value.time,
      };
      delete formData.datetimes;
    }

    formData.patientId = this.patientControl.value && this.appointmentForm.get("patientId")?.value

    this.isSubmitting.set(true);

    const request$ = this.isEditing
      ? this.appointmentService.updateAppointment(
          this.data.appointment.id,
          formData,
        )
      : this.appointmentService.createAppointment(formData);

    request$
      .pipe(
        first(),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.toastService.openToast(
            this.isEditing
              ? this.translocoService.translate('app-dialog.update_success')
              : this.translocoService.translate('app-dialog.create_success'),
          );
          this.dialogRef.close(res);
        },
        error: (err) => {
          const errorMessage = this.isEditing
            ? this.translocoService.translate('app-dialog.update_error')
            : this.translocoService.translate('app-dialog.update_error');
          const message = err.error.message || err.message || errorMessage;
          this.toastService.openToast(message, this.translocoService.translate('app-dialog.error'), 'error');
        },
      });
  }

  getCurrency(paymentType: PaymentMethodType): string {
    switch (paymentType) {
      case PaymentMethodType.DC:
        return this.translocoService.translate('app-dialog.dushanbe');
      case PaymentMethodType.CASH:
        return this.translocoService.translate('app-dialog.cash');
      case PaymentMethodType.ESKHATA:
        return this.translocoService.translate('app-dialog.eskhata');
      case PaymentMethodType.ALIF:
        return this.translocoService.translate('app-dialog.alif');
    }
  }

  protected readonly Plus = Plus;

  addDateTime(): void {
    const lastIndex = this.dateTimes.length - 1;
    const lastValue =
      lastIndex >= 0
        ? (this.dateTimes.at(lastIndex).value as {
            date: string | null;
            time: string | null;
          })
        : null;

    const nextDate = lastValue?.date
      ? this.getNextDayISO(lastValue.date)
      : null;
    const nextTime = lastValue?.time ?? null;

    this.dateTimes.push(this.dateTimesGroup(nextDate, nextTime));
  }

  private getNextDayISO(baseDate: string): string {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + 1);
    return this.toISODateOnly(date);
  }

  private toISODateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  removeDateTime(index: number): void {
    this.dateTimes.removeAt(index);
  }
}
