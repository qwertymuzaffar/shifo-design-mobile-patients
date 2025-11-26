import { AppointmentModel } from '@models/appointment.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppointmentDetailsComponent } from '@features/appointments/dialogs/appointment-details/appointment-details.component';
import { inject } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
    private matDialog = inject(MatDialog);

  openDetails(appointment: AppointmentModel) : MatDialogRef<AppointmentDetailsComponent> {
    return this.matDialog.open(AppointmentDetailsComponent, {
      data: appointment,
      width: '100%',
      maxWidth: '900px',
      height: '900px',
    });
  }

}
