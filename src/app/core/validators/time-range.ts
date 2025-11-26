import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function timeRangeValidator(min: string, max: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const normalize = (time: string): Date => {
      const [hours, minutes] = time.split(':').map(Number);
      return new Date(0, 0, 0, hours, minutes);
    };

    const valueTime = normalize(control.value);
    const minTime = normalize(min);
    const maxTime = normalize(max);

    return valueTime >= minTime && valueTime <= maxTime
      ? null
      : { customError: `Время должно быть в диапазоне ${min}–${max}` };
  };
}
