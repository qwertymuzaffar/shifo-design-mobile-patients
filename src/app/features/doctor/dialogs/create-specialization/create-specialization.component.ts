import { Component, inject, signal } from '@angular/core';
import { FormFieldComponent } from '@shared/controls';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SpecializationService } from '@core/services/specialization.service';
import { finalize, first } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-create-specialization',
  imports: [TranslocoPipe, FormFieldComponent, ReactiveFormsModule, MatDialogClose],
  templateUrl: './create-specialization.component.html',
  styleUrl: './create-specialization.component.scss',
})
export class CreateSpecializationComponent {

  lang = "";
  constructor(private transloco: TranslocoService) {
    this.lang = this.transloco.getActiveLang();
  }

  readonly isLoading = signal<boolean>(false);
  private specializationService = inject(SpecializationService);
  private matDialogRef = inject(MatDialogRef<CreateSpecializationComponent>);

  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.specializationService
      .createSpecialization(this.form.getRawValue()['name'] as string)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (specialization) => {
          this.form.reset();
          this.matDialogRef.close(specialization);
        },
        error: (error) => {
          if (this.lang == 'ru') {
            const errorMessage = error?.error?.message || 'Специализация с таким именем уже существует';
            this.form.controls['name'].setErrors({
              customError: errorMessage,
            });
          }
          else {
            const errorMessage = error?.error?.message || 'A specialization with this name already exists';
            this.form.controls['name'].setErrors({
              customError: errorMessage,
            });
          }
        },
      });
  }
}
