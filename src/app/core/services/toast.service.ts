import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { ToastComponent, ToastDataInterface, ToastType } from '@shared/components';


@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private snackBar = inject(MatSnackBar);
  private translocoService = inject(TranslocoService)

  openToast(
    message: string,
    title: string = this.translocoService.translate('app-dialog.success'),
    type: ToastType = 'success',
  ): void {
    this.snackBar.openFromComponent<ToastComponent, ToastDataInterface>(
      ToastComponent,
      {
        panelClass: 'custom-snackbar',
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 3000,
        data: {
          type,
          title,
          message,
        },
      },
    );
  }
}
