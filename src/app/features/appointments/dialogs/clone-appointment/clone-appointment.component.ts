import { Component, inject, OnInit, signal } from '@angular/core';
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
import { AppointmentService } from '@core/services/appointment.service';
import { FormFieldComponent } from '@shared/controls';
import { DatePipe } from '@angular/common';
import { finalize, first } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';


@Component({
  selector: 'app-clone-appointment',
  imports: [
    TranslocoPipe,
    FormsModule,
    MatDialogClose,
    ReactiveFormsModule,
    FormFieldComponent,
    DatePipe,
  ],
  templateUrl: './clone-appointment.component.html',
  styleUrl: './clone-appointment.component.scss',
  providers: [DatePipe],
})
export class CloneAppointmentComponent implements OnInit {
  constructor(private translocoService: TranslocoService) {}
  readonly form = new FormGroup({
    copyDate: new FormControl<string | null>(null, [Validators.required]),
    dateTo: new FormControl<string | null>(null, [Validators.required]),
  });
  public dateTo: string | undefined = inject(MAT_DIALOG_DATA);
  readonly isLoading = signal(false);
  private appointmentService = inject(AppointmentService);
  private matDialogRef = inject(MatDialogRef<CloneAppointmentComponent>);
  private toastService = inject(ToastService);
  private datePipe = inject(DatePipe);

  ngOnInit() {
    if (!this.dateTo) return;

    this.form.patchValue({
      dateTo: this.dateTo,
    });
  }

  onSubmit(): void {
    if (!this.form.value.copyDate || !this.form.value.dateTo) {
      this.form.markAllAsTouched();
      return;
    }

    const dateFrom = this.datePipe.transform(
      this.form.value.copyDate,
      'yyyy-MM-dd',
    ) as string;
    const dateTo = this.datePipe.transform(
      this.form.value.dateTo,
      'yyyy-MM-dd',
    ) as string;

    this.isLoading.set(true);
    this.appointmentService
      .cloneAppointment(dateFrom, dateTo)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.matDialogRef.close(true);
          this.toastService.openToast(this.translocoService.translate('app-dialog.import_success'), this.translocoService.translate('app-dialog.success'));
        },
        error: (err) => {
          const message = err.error?.message || this.translocoService.translate('app-dialog.import_error');
          this.toastService.openToast(
            message,
            this.translocoService.translate('app-dialog.error'),
            'error',
          );
        },
      });
  }
}
