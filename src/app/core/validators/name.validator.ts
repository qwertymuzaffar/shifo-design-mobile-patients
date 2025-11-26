import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁӣӢқҚӯӮҳҲҷҶғҒ\s'.-]{2,50}$/;

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.trim();

    const isValid = NAME_REGEX.test(value);

    return isValid
      ? null
      : {
          customError:
            value.length < 2
              ? 'Минимальная длина 2 символа'
              : 'Поле может содержать только буквы и пробелы',
        };
  };
}
