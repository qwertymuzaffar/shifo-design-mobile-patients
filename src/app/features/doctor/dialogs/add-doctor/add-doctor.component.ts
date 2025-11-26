import {Component, inject, OnInit, signal} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { DoctorService } from '@core/services/doctor.service';
import { ToastService } from '@core/services/toast.service';
import { FormFieldComponent } from '@shared/controls';
import { finalize, first } from 'rxjs';
import { Doctor, DoctorCreate } from '@features/doctor/models/doctor';
import { SpecializationService } from '@core/services/specialization.service';
import {rxResource} from '@angular/core/rxjs-interop';
import { Eye, EyeOff, LucideAngularModule, Plus } from 'lucide-angular';
import { NgxMaskDirective } from 'ngx-mask';
import { nameValidator } from '@core/validators/name.validator';
import { passwordCompositionValidator } from '@core/validators/password-composition.validator';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';


enum WorkingDays {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

interface DialogData {
  doctor?: Doctor;
  isViewMode?: boolean;
}

@Component({
  selector: 'app-add-doctor',
  standalone: true,
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    FormFieldComponent,
    LucideAngularModule,
    NgxMaskDirective,
  ],
  templateUrl: './add-doctor.component.html',
  styleUrl: './add-doctor.component.scss',
})
export class AddDoctorComponent implements OnInit {

  lang = '';

  constructor(private transloco: TranslocoService) {
  this.lang = this.transloco.getActiveLang();
  }

  readonly data: DialogData = inject(MAT_DIALOG_DATA);
  readonly doctor: Doctor | undefined = this.data?.doctor;
  readonly isViewMode: boolean = this.data?.isViewMode ?? false;
  readonly EyeOff = EyeOff;
  readonly Eye = Eye;

  private doctorService = inject(DoctorService);
  private toastService = inject(ToastService);
  private matDialogRef = inject(MatDialogRef);
  private specializationService = inject(SpecializationService);

  passwordToggle = false;
  specialization = rxResource({
    stream: () => this.specializationService.getSpecializations(),
    defaultValue: [],
  });

  readonly isLoading = signal<boolean>(false);

  public doctorForm = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required, nameValidator()]),
      lastName: new FormControl('', [Validators.required, nameValidator()]),
      specialization: new FormControl<number>(0, Validators.required),
      phone: new FormControl('+992', Validators.required),
      username: new FormControl("", {nonNullable: true, validators: [Validators.required]}),
      password: new FormControl("", {nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(100), passwordCompositionValidator]}),
      email: new FormControl(),
      experience: new FormControl(0, [Validators.required, Validators.min(0)]),
      consultationFee: new FormControl(0, [
        Validators.required,
        Validators.min(0),
      ]),
      startTime: new FormControl('08:00', Validators.required),
      endTime: new FormControl('17:00', Validators.required),
      workDays: new FormControl<number[]>([1, 2, 3, 4, 5]),
    },
  );

  public weekDays: { [lang: string]: { label: string; value: WorkingDays }[] } = {
    ru: [
      { label: 'Пн', value: WorkingDays.Monday },
      { label: 'Вт', value: WorkingDays.Tuesday },
      { label: 'Ср', value: WorkingDays.Wednesday },
      { label: 'Чт', value: WorkingDays.Thursday },
      { label: 'Пт', value: WorkingDays.Friday },
      { label: 'Сб', value: WorkingDays.Saturday },
      { label: 'Вс', value: WorkingDays.Sunday },
    ],
    en: [
      { label: 'Mon', value: WorkingDays.Monday },
      { label: 'Tue', value: WorkingDays.Tuesday },
      { label: 'Wed', value: WorkingDays.Wednesday },
      { label: 'Thu', value: WorkingDays.Thursday },
      { label: 'Fri', value: WorkingDays.Friday },
      { label: 'Sat', value: WorkingDays.Saturday },
      { label: 'Sun', value: WorkingDays.Sunday },
    ]
  };

  get workDays(): number[] {
    return this.doctorForm.get('workDays')?.value || [];
  }

  ngOnInit(): void {
    if (this.doctor) {
      this.doctorForm.patchValue({
        ...(this.doctor as any),
        phone: this.doctor.user.phone,
        username: this.doctor.user.username,
        email: this.doctor.user.email,
        specialization: this.doctor.specialization?.id,
        startTime: this.doctor.workingHours?.start || '09:00',
        endTime: this.doctor.workingHours?.end || '17:00',
        workDays: this.doctor.workingHours?.workingDays || [1, 2, 3, 4, 5],
      });
    }

    if (this.isViewMode) {
      this.doctorForm.disable();
    }
  }

  onSubmit(): void {
    this.isLoading.set(true);
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }
    const raw = this.doctorForm.getRawValue();
    const code = '+992'
    const phone = (raw.phone ?? '').startsWith(code)
      ? (raw.phone ?? '')
      : `${code}${raw.phone}`;
    const formValue: DoctorCreate = {
      firstName: raw.firstName ?? '',
      lastName: raw.lastName ?? '',
      specialization: raw.specialization as any,
      phone,
      experience: Number(raw.experience ?? 0),
      consultationFee: Number(raw.consultationFee ?? 0),
      isActive: true,
      username: raw.username,
      password: raw.password,
      email: raw.email,
      workingHours: {
        start: raw.startTime ?? '',
        end: raw.endTime ?? '',
        workingDays: raw.workDays ?? [],
      },
    };

    const request$ = this.doctor
      ? this.doctorService.updateDoctor(this.doctor.id, formValue)
      : this.doctorService.createDoctor(formValue);

    request$
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (doctor: Doctor) => {
          this.toastService.openToast(
            '',
            this.doctor ? this.transloco.translate('doctor.updated') : this.transloco.translate('doctor.created'),
          );
          this.doctorForm.reset();
          this.matDialogRef.close(doctor);
        },
        error: (error) => {
          console.error('Ошибка:', error);
          this.toastService.openToast(
            this.transloco.translate('doctor.error'),
             this.transloco.translate('doctor.save_error'),
            'error',
          );
        },
      });
  }

  toggleWorkDay(day: number): void {
    const currentDays = this.workDays;
    const isSelected = currentDays.includes(day);
    const updatedDays = isSelected
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    this.doctorForm.controls.workDays.setValue(updatedDays);
    this.doctorForm.controls.workDays.markAsDirty();
  }

  closeModal(): void {
    this.matDialogRef.close();
  }

  protected readonly Plus = Plus;

  formatNameCase(control: FormControl): void {
    const value = control.value?.trim();
    if (!value) return;

    const formatted = value
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    control.setValue(formatted, { emitEvent: false });
  }

  formatNumericInput(control: FormControl): void {
    const value = control.value;
    if (value === null || value === '' || isNaN(value)) {
      return;
    }

    const numericValue = Number(value);

    control.setValue(numericValue, { emitEvent: false });
  }

  onSpecializationChange(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    selectEl.blur();
  }

  onKeyDown(event: KeyboardEvent): void {
    const pattern = /[0-9]/;
    if (pattern.test(event.key)) {
      event.preventDefault();
    }
  }
}
