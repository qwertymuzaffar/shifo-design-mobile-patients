import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, first } from 'rxjs';
import { LucideAngularModule, X } from 'lucide-angular';
import { PatientService } from '@features/patients/services/patient.service';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { PatientModel } from '@features/patients/models/patient.model';
import { nameValidator } from '@core/validators/name.validator';
import { FormFieldComponent } from '@shared/controls';
import { ToastService } from '@core/services/toast.service';
import { NgxMaskDirective } from 'ngx-mask';
import { noDuplicateCommaValidator } from '@core/validators/no-duplicate.validator';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

interface DialogData {
  patient?: PatientModel;
  isViewMode?: boolean;
}

@Component({
  selector: 'app-manage-patient',
  imports: [
    TranslocoPipe,
    LucideAngularModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormFieldComponent,
    NgxMaskDirective,
  ],
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss'],
  providers: [PatientService],
})
export class AddPatientComponent implements OnInit {
  lang = "" 
  constructor(private transloco: TranslocoService) {
      this.lang = this.transloco.getActiveLang();
   }

  readonly isLoading = signal<boolean>(false);
  protected readonly X = X;
  private matDialogRef = inject(MatDialogRef<AddPatientComponent>);
  readonly data: DialogData = inject(MAT_DIALOG_DATA);
  readonly patient: PatientModel | undefined = this.data?.patient;
  readonly isViewMode: boolean = this.data?.isViewMode ?? false;
  private patientService = inject(PatientService);
  private toastService = inject(ToastService);
  patients: PatientModel[] = [];

  readonly form = new FormGroup({
    fullName: new FormControl<string>('', [
      Validators.required,
      nameValidator(),
    ]),
    phone: new FormControl<string>('', [Validators.required]),
    birthDate: new FormControl<string>(new Date().toISOString().split('T')[0], [
      Validators.required,
      this.futureDateValidator.bind(this),
    ]),
    address: new FormControl<string>(''),
    emergencyContact: new FormControl<string>(''),
    allergies: new FormControl<string>('', [noDuplicateCommaValidator()]),
    medicalHistory: new FormControl<string>(''),
  });

  onDateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.form.controls['birthDate'].setValue(new Date(value).toISOString().split('T')[0]);
  }

  ngOnInit(): void {
    if (this.patient) {
      this.form.patchValue(this.patient);
    }

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  create:{[lang: string]: string } = {
    ru: 'Пациент успешно создан',
    en:  'Patient successfully created'
  }
  update:{[lang: string]: string } = {
    ru: 'Пациент успешно обновлен',
    en: 'Patient successfully updated'
  }
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.form.getRawValue() as PatientModel;

    const request$ = this.patient
      ? this.patientService.updatePatient(this.patient.id, formValue)
      : this.patientService.createPatient(formValue);

    request$
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toastService.openToast(
            '',
            this.patient
              ? this.update[this.lang]
              : this.create[this.lang],
          );
          this.form.reset();
          this.matDialogRef.close(true);
        },
        error: (error) => {
          console.error('error:', error);
        },
      });
  }

  futureDateValidator(control: AbstractControl) {
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (control.value && inputDate > today) {
      return { futureDate: true };
    }
    return null;
  }
}
