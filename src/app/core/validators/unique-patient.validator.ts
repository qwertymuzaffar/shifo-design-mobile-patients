import {PatientModel} from "@features/patients/models/patient.model";
import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function uniquePatientValidator(existingPatients?: PatientModel[]): ValidatorFn {

  return (formGroup: AbstractControl): ValidationErrors | null => {
    const fullNameControl = formGroup.get('fullName');
    const phoneControl = formGroup.get('phone');
    const fullName = fullNameControl?.value?.trim()?.toLowerCase();
    const phone = phoneControl?.value?.trim();

    if (fullNameControl?.hasError('duplicateFullName')) {
      fullNameControl.setErrors(null);
    }
    if (phoneControl?.hasError('duplicatePhone')) {
      phoneControl.setErrors(null);
    }
    if (!existingPatients || existingPatients.length === 0) {
      return null;
    }
    const fullNameExists = existingPatients.some(
      patient => patient.fullName.trim().toLowerCase() === fullName
    );
    const phoneExists = existingPatients.some(
      patient => patient.phone.trim() === phone
    );
    if (fullNameExists) {
      fullNameControl?.setErrors({
        ...fullNameControl.errors,
        duplicateFullName: 'Пациент с таким именем уже существует.',
      });
    }
    if (phoneExists) {
      phoneControl?.setErrors({
        ...phoneControl.errors,
        duplicatePhonePatient: 'Пациент с таким номером уже существует.',
      });
    }
    if (fullNameExists && phoneExists) {
      return { duplicatePatient: 'Пациент с таким именем и номером уже существует.' };
    }

    return null;
  };
}
