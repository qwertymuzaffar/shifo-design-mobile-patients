import {Component, DestroyRef, inject, signal} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import {MatButton} from "@angular/material/button";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { Observable } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

interface ConfirmDialogData {
  message?: string,
  btnText?: string,
  action?: () => Observable<void>
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [
    TranslocoPipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ]
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef);
  readonly isLoading = signal<boolean>(false);
  public data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);

  public confirm(): void {
    if (this.data.action) {
      this.isLoading.set(true);
      this.data.action()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.isLoading.set(false);
          this.dialogRef.close(false);
        },
      });
    } else {
      this.dialogRef.close(true);
    }
  }

  public cancel(): void {
    this.dialogRef.close(false);
  }
}
