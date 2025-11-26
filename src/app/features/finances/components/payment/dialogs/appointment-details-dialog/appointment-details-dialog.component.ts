import { Component, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PhoneFormatPipe } from '@core/pipes/phone-format.pipe';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StatusTranslatePipe } from '@core/pipes/translate.pipe';
import { TypeTranslatePipe } from '@core/pipes/type-translate.pipe';
import { Daum } from '../../models/payment.models';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

export interface AppointmentDialogData {
  payment: Daum;
}

@Component({
  selector: 'app-appointment-details-dialog',
  imports: [
    DatePipe,
    TranslocoPipe,
    PhoneFormatPipe,
    StatusTranslatePipe,
    TypeTranslatePipe,
  ],
  templateUrl: './appointment-details-dialog.component.html',
  styleUrl: './appointment-details-dialog.component.scss',
})
export class AppointmentDetailsDialogComponent {
  payment = this.data.payment;
  appointment = this.data.payment.appointment;
  patient = this.data.payment.patient ?? this.data.payment.appointment?.patient;

  get displayCreatedAt(): string {
    return this.appointment?.createdAt ?? this.payment.createdAt;
  }

  get allergiesText(): string {
    const allergies = this.patient?.allergies;
    if (!Array.isArray(allergies)) return this.transloco.translate('pay.no');
    return (
      allergies
        .map((a) => a?.trim())
        .filter((a) => a !== '')
        .join(', ') || this.transloco.translate('pay.no')
    );
  }

  constructor(
    public dialogRef: MatDialogRef<AppointmentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentDialogData,
    private transloco: TranslocoService,
  ) {}
}
