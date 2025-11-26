import { Component, inject, signal } from '@angular/core';
import { FormFieldComponent } from '@shared/controls';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppointmentService } from '@core/services/appointment.service';
import { finalize, first } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-cancel-appointment',
  imports: [TranslocoPipe, FormFieldComponent, MatDialogClose, ReactiveFormsModule, NgClass],
  templateUrl: './cancel-appointment.component.html',
  styleUrl: './cancel-appointment.component.scss',
})
export class CancelAppointmentComponent {
  lang = '';
  
  readonly isLoading = signal(false);
  readonly selectedTabIndex = signal(0);
  readonly form = new FormGroup({
    reason: new FormControl('', [Validators.required]),
  });

  constructor(private transloco: TranslocoService) {
    this.lang = this.transloco.getActiveLang();
  }

  private appointmentService = inject(AppointmentService);
  private data = inject(MAT_DIALOG_DATA) as { id: number };
  private appointmentId = this.data.id;
  private toastService = inject(ToastService);
  private matDialogRef = inject(MatDialogRef<CancelAppointmentComponent>);

  readonly cancelReasons = {
    ru: [
      'Пациент не пришёл',
      'Доктор недоступен',
      'Техническая причина',
      'Другая причина',
    ],
    en: [
      'Patient did not show up',
      'Doctor unavailable',
      'Technical reason',
      'Other reason'
    ]
  };


  handleCancelReason(reason: string) {
    this.form.patchValue({ reason });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    const reasonControl = this.form.get('reason');
    if (index === 1) {
      reasonControl?.clearValidators();
    } else {
      reasonControl?.setValidators([Validators.required]);
    }
    reasonControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    const isForever = this.selectedTabIndex() === 1;
    
    if (!isForever && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    if (isForever) {
      this.appointmentService
        .updateAppointment(this.appointmentId, {
          status: AppointmentStatus.CANCELLED_FOREVER,
        } as any)
        .pipe(
          first(),
          finalize(() => this.isLoading.set(false)),
        )
        .subscribe({
          next: () => {
            this.matDialogRef.close(true);
          },
          error: (err) => {
            const message =
              err.error.message || err.message || this.transloco.translate('app-dialog.cancel_error');
            this.toastService.openToast(
              message,
              this.transloco.translate('app-dialog.error'),
              'error',
            );
          },
        });
    } else {
      this.appointmentService
        .cancelAppointment(this.appointmentId, this.form.value.reason as string)
        .pipe(
          first(),
          finalize(() => this.isLoading.set(false)),
        )
        .subscribe({
          next: () => {
            this.matDialogRef.close(true);
          },
          error: (err) => {
            const message =
              err.error.message || err.message || this.transloco.translate('app-dialog.cancel_error');
            this.toastService.openToast(
              message,
              this.transloco.translate('app-dialog.error'),
              'error',
            );
          },
        });
    }
  }
}
