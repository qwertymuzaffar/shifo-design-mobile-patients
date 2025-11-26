import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Doctor } from "@features/doctor/models/doctor";

function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}


export function uniqueDoctorValidator(existingDoctors: Doctor[]): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    if (!existingDoctors || existingDoctors.length === 0) {
      return null;
    }

    const firstNameControl = formGroup.get('firstName');
    const lastNameControl = formGroup.get('lastName');
    const phoneControl = formGroup.get('phone');

    ['duplicateFirstName', 'duplicateLastName', 'duplicateSpecialization', 'duplicatePhone'].forEach(errKey => {
      [firstNameControl, lastNameControl, phoneControl].forEach(control => {
        if (control?.hasError(errKey)) {
          const errors = { ...control.errors };
          delete errors[errKey];
          control.setErrors(Object.keys(errors).length ? errors : null);
        }
      });
    });

    const firstName = firstNameControl?.value?.trim().toLowerCase() ?? '';
    const lastName = lastNameControl?.value?.trim().toLowerCase() ?? '';
    const phone = phoneControl?.value?.trim() ?? '';

    const threshold = 2;

    const isSimilarNameExists = existingDoctors.some(doc => {
      const existingFirstName = doc.firstName.trim().toLowerCase();
      const existingLastName = doc.lastName.trim().toLowerCase();

      return (
        levenshteinDistance(existingFirstName, firstName) <= threshold &&
        levenshteinDistance(existingLastName, lastName) <= threshold
      );
    });

    const phoneExists = existingDoctors.some(doc => doc.phone.trim() === phone);

    if (isSimilarNameExists) {
      firstNameControl?.setErrors({
        ...firstNameControl.errors,
        duplicateDoctorFirstName: 'Доктор с таким именем и фамилией уже существует.',
      });
      lastNameControl?.setErrors({
        ...lastNameControl.errors,
        duplicateDoctorLastName: 'Доктор с таким именем и фамилией уже существует.',
      });
    }

    if (phoneExists) {
      phoneControl?.setErrors({
        ...phoneControl.errors,
        duplicatePhoneDoctor: 'Доктор с таким телефоном уже существует.',
      });
    }
    if (isSimilarNameExists && phoneExists) {
      return { duplicateDoctor: 'Доктор с таким именем, фамилией, специализацией и телефоном уже существует.' };
    }

    return null;
  };
}
