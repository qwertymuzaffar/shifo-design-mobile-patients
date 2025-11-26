import { Component, inject, input, output } from '@angular/core';
import { Copy, LucideAngularModule } from 'lucide-angular';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DuplicateAppointmentComponent } from '@features/appointments/dialogs/duplicate-appointment/duplicate-appointment.component';
import { first } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-duplicate-button',
  imports: [
    TranslocoPipe,
    LucideAngularModule,
    MatTooltip,
    NgxPermissionsModule,
  ],
  templateUrl: './duplicate-button.component.html',
  styleUrl: './duplicate-button.component.scss',
})
export class DuplicateButtonComponent {
  readonly appointmentDuplicated = output<void>();
  readonly appointmentId = input.required<number>();
  protected readonly Copy = Copy;
  private matDialog = inject(MatDialog);
  protected readonly userRole = UserRole;

  public duplicate(): void {
    const dialogRef = this.matDialog.open(DuplicateAppointmentComponent, {
      data: this.appointmentId(),
      width: '500px'
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((res) => {
        if (res) {
          this.appointmentDuplicated.emit();
        }
      });
  }
}
