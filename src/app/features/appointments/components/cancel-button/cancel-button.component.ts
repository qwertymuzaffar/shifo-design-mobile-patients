import { Component, inject, input, output } from '@angular/core';
import { CircleX, LucideAngularModule } from 'lucide-angular';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { first } from 'rxjs';
import { CancelAppointmentComponent } from '@features/appointments/dialogs/cancel-appointment/cancel-appointment.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';


@Component({
  selector: 'app-cancel-button',
  imports: [
    TranslocoPipe,
    LucideAngularModule,
    MatTooltip,
    MatTooltip,
    NgxPermissionsModule
  ],
  templateUrl: './cancel-button.component.html',
  styleUrl: './cancel-button.component.scss',
})
export class CancelButtonComponent {
  protected readonly CircleX = CircleX;
  constructor(private translocoService: TranslocoService) {}

  appointmentCancelled = output<void>();
  appointmentId = input.required<number>();

  private matDialog = inject(MatDialog);
  private toastService = inject(ToastService);

  cancelAppointment(): void {
    const dialogRef = this.matDialog.open(CancelAppointmentComponent, {
      data: this.appointmentId(),
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          const translated = this.translocoService.translate(
            'app-dialog.cancel_success',
          );
          if (res) {
            this.toastService.openToast(translated);
            this.appointmentCancelled.emit();
          }
        },
      });
  }

  protected readonly userRole = UserRole;
}
