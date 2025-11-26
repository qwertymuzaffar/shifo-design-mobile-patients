import { Component, inject, input, output } from '@angular/core';
import { CheckCircle, LucideAngularModule } from 'lucide-angular';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/toast.service';
import { first } from 'rxjs';
import { PaymentDialogComponent } from '@features/appointments/dialogs/payment-dialog/payment-dialog.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-complete-button',
  imports: [
    TranslocoPipe,
    LucideAngularModule,
    MatTooltip,
    NgxPermissionsModule,
  ],
  templateUrl: './complete-button.component.html',
  styleUrl: './complete-button.component.scss',
})
export class CompleteButtonComponent {
  constructor(private translocoService: TranslocoService) {}
  protected readonly CheckCircle = CheckCircle;

  readonly appointmentCompleted = output<void>();
  private matDialog = inject(MatDialog);
  private toastService = inject(ToastService);
  readonly appointmentId = input.required<number>();

  public completeAppointment(): void {
    const dialogRef = this.matDialog.open(PaymentDialogComponent, {
      data: this.appointmentId(),
      disableClose: true,
      width: '500px'
    });

    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          if (res) {
            this.appointmentCompleted.emit();
            this.toastService.openToast(
              this.translocoService.translate('app-dialog.complete_success'),
              this.translocoService.translate('app-dialog.success'),
            );
          }
        },
        error: () => {
          this.toastService.openToast(
            this.translocoService.translate('app-dialog.complete_error'),
            this.translocoService.translate('app-dialog.error'),
            'error',
          );
        },
      });
  }

  protected readonly userRole = UserRole;
}
