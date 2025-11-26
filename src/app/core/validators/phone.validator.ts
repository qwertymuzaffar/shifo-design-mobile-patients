import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const phoneRegex = /^\+?992(9\d{8}|10\d{7})$/;
    const isValid = phoneRegex.test(value);
    return isValid
      ? null
      : {
          customError:
            'Номер телефона должен начинаться с +992 и содержать 9 цифр после.',
        };
  };
}
