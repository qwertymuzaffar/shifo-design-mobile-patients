import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function duplicateDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    control.controls.forEach((grp) => {
      const dateCtrl = (grp as FormGroup).get('date');
      if (!dateCtrl) return;

      const errors = dateCtrl.errors as ValidationErrors | null;
      if (errors?.['customError']) {
        const { customError, ...rest } = errors;
        dateCtrl.setErrors(Object.keys(rest).length ? rest : null);
      }
    });

    const dateToIndexes = new Map<string, number[]>();
    control.controls.forEach((grp, idx) => {
      const date = (grp as FormGroup).get('date')?.value as string | null;
      const normalized = typeof date === 'string' ? date.trim() : '';
      if (!normalized) return;

      const arr = dateToIndexes.get(normalized) ?? [];
      arr.push(idx);
      dateToIndexes.set(normalized, arr);
    });

    dateToIndexes.forEach((indexes) => {
      if (indexes.length <= 1) return;

      indexes.forEach((i) => {
        const dateCtrl = (control.at(i) as FormGroup).get('date');
        if (!dateCtrl) return;

        const current = (dateCtrl.errors as ValidationErrors | null) ?? {};
        dateCtrl.setErrors({
          ...current,
          customError: 'Даты не должны повторяться',
        });
        dateCtrl.markAsTouched();
      });
    });

    return null;
  };
}
