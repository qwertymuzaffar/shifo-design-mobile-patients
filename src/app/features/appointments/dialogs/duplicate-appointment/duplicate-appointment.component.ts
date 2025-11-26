import {Component, inject, OnInit, signal} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormFieldComponent } from '@shared/controls';
import { LucideAngularModule, X } from 'lucide-angular';
import { ToastService } from '@core/services/toast.service';
import { AppointmentService } from '@core/services/appointment.service';
import { finalize, first } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';


interface AppointmentForm {
  date: FormControl<string>;
  time: FormControl<string>;
}

@Component({
  selector: 'app-duplicate-appointment',
  imports: [
    TranslocoPipe,
    FormsModule,
    MatDialogClose,
    FormFieldComponent,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './duplicate-appointment.component.html',
  styleUrl: './duplicate-appointment.component.scss',
})
export class DuplicateAppointmentComponent implements OnInit {
  protected readonly X = X;
 constructor(private translocoService: TranslocoService){}

  readonly form = new FormGroup<AppointmentForm>({
    date: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  private matDialogRef = inject(MatDialogRef<DuplicateAppointmentComponent>);
  private appointmentService = inject(AppointmentService);
  private toastService = inject(ToastService);
  private data = inject(MAT_DIALOG_DATA) as { id: number };
  private appointmentId = this.data.id;

  readonly isLoading = signal(false);

  ngOnInit(): void {
    const currentData = new Date();
    this.form.patchValue({
      date: currentData.toISOString().split('T')[0],
      time: currentData.toTimeString().slice(0, 5),
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.appointmentService
      .duplicateAppointment(this.appointmentId, this.form.getRawValue())
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.matDialogRef.close(true);
          this.toastService.openToast(this.translocoService.translate('app-dialog.duplicate_success'), this.translocoService.translate('app-dialog.success'));
        },
        error: (err) => {
          const message =
            err.error.message ||
            err.message ||
            this.translocoService.translate('app-dialog.duplicate_error');
          this.toastService.openToast(message, this.translocoService.translate('app-dialog.error'), 'error');
        },
      });
  }
}
